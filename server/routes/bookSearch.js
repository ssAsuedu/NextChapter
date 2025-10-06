// server/routes/bookSearch.js
import { Router } from 'express';

const router = Router();
const HC_URL = process.env.HARDCOVER_GRAPHQL || "https://api.hardcover.app/v1/graphql";
// NOTE: This token is expired (Expires Oct 2, 2025). Ensure you replace it with a fresh one.
const HC_TOKEN = process.env.HARDCOVER_API_TOKEN || "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJIYXJkY292ZXIiLCJ2ZXJzaW9uIjoiOCIsImp0aSI6IjA3NzgwYTFkLWY0Y2YtNGMxYy1iMzU2LWM2Nzg5OTU5NTdiOSIsImFwcGxpY2F0aW9uSWQiOjIsInN1YiI6IjQ4OTM4IiwiYXVkIjoiMSIsImlkIjoiNDg5MzgiLCJsb2dnZWRJbiI6dHJ1ZSwiaWF0IjoxNzU5NDIwNDc5LCJleHAiOjE3OTA5NTY0NzksImh0dHBzOi8vaGFzdXJhLmlvL2p3dC9jbGFpbXMiOnsieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1yb2xlIjoidXNlciIsIlgtaGFzdXJhLXVzZXItaWQiOiI0ODkzOCJ9LCJ1c2VyIjp7ImlkIjo0ODkzOH19.4A1Zr85btg5dtjzOX8S5QC1lcRzPI4BXqlM5_ctUDTY";

router.get('/books', async (req, res) => {
  const q = (req.query.q || '').trim();
  
  if (!q) {
    return res.status(400).json({ error: 'Missing q' });
  }

  const query = `
    query SearchBooks($q: String!, $page: Int!, $per: Int!) {
      search(query: $q, query_type: "Book", page: $page, per_page: $per) {
        results
      }
    }
  `;

  try {
    const r = await fetch(HC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': HC_TOKEN,
      },
      body: JSON.stringify({ query, variables: { q, page: 1, per: 20 } }),
    });

    let json;
    try {
      json = await r.json();
    } catch (e) {
      // Handle non-JSON response (e.g., plain text error)
      const responseText = await r.text();
      return res.status(500).json({ 
        error: 'Hardcover response not valid JSON', 
        raw_response: responseText.substring(0, 200) 
      });
    }
    
    if (!r.ok || json.errors) {
      // Handle API errors (4xx, 5xx, or GraphQL errors field)
      return res.status(r.status >= 400 ? r.status : 502).json({ 
        error: 'Hardcover API error', 
        details: json.errors || json.error || json 
      });
    }

    const searchResults = json.data?.search?.results;
    
    // Check for the expected structure (often an object with a 'hits' array)
    if (searchResults && Array.isArray(searchResults.hits)) {
      // Return the hits array directly if found in the search object
      return res.json({ 
        items: searchResults.hits, // Map 'hits' to 'items' for client compatibility
      });
      
    } else if (Array.isArray(searchResults)) {
      // Fallback: Check if results is a direct array (older/simpler response format)
      
      const items = searchResults.map(b => ({
        id: b.id,
        title: b.title,
        author_names: b.author_names,
        rating: b.rating,
        users_count: b.users_count,
        isbns: b.isbns,
        release_year: b.release_year,
        slug: b.slug,
        cover_color: b.cover_color,
        // Include properties from the extended debug logic, just in case
        genres: b.genres,
        description: b.description,
        pages: b.pages,
        image: b.image,
        subtitle: b.subtitle
      }));
      
      return res.json({ items });
      
    } else {
      // Handle the case where the structure is unexpected or empty
      return res.json({ items: [] });
    }
    
  } catch (err) {
    // Handle network or general proxy failure
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
});

export default router;