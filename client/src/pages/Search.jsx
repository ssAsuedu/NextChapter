// filepath: /src/pages/Contact.jsx
import React, { useState, useMemo } from "react";
import axios from "axios";
import "../styles/SearchPage/Search.css";
import BookCard from "../components/SearchPage/BookCard";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Search = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(""); 
  const [genres, setGenres] = useState([]); 

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}`
      );

      const fetchedBooks = response.data.items || [];
      setBooks(fetchedBooks);


      setSelectedGenre("");

      const allGenres = fetchedBooks.flatMap(
        (b) => b.volumeInfo?.categories || []
      );
      setGenres([...new Set(allGenres)]);
    } catch (err) {
      setBooks([]);
      setGenres([]);
      setSelectedGenre(""); // reset the filter whenever a new search happens 
    }

    setLoading(false);
  };

  const filteredBooks = useMemo(() => {
    if (!selectedGenre) return books;
    return books.filter((b) =>
      b.volumeInfo?.categories?.includes(selectedGenre)
    );
  }, [books, selectedGenre]);

  return (
    <div className="search-page">
      <h1>Book Search</h1>
      <form className="search-page-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-page-input"
        />
        <button type="submit" className="browse-button" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {genres.length > 0 && (
        <div className="genre-filter-container">
          <h2 htmlFor="genre-filter">Genre:</h2>
          <select
            id="genre-filter"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="genre-filter"
          >
            <option value="">All Genres</option>
            {genres.map((genre, idx) => (
              <option key={idx} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        
      )}

      <div className="results-section">
        {filteredBooks.length > 0 ? (
          <div className="category-scroll-wrapper">
            <button
              className="scroll-btn left"
              onClick={() =>
                document.getElementById("search-carousel").scrollBy({
                  left: -500,
                  behavior: "smooth",
                })
              }
            >
              &#8249;
            </button>
              
            <div className="category-scroll" id="search-carousel">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  info={book.volumeInfo}
                  volumeId={book.id}
                />
              ))}
            </div>
              
            <button
              className="scroll-btn right"
              onClick={() =>
                document.getElementById("search-carousel").scrollBy({
                  left: 500,
                  behavior: "smooth",
                })
              }
            >
              &#8250;
            </button>
          </div>
        ) : (
          <p className="no-results">{loading ? "" : "No results found."}</p>
        )}
      </div>
    </div>
  );
};

export default Search;
