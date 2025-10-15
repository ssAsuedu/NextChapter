// filepath: /src/pages/Contact.jsx
import React, { useState } from "react";
import axios from "axios";
import "../styles/SearchPage/Search.css";
import BookCard from "../components/SearchPage/BookCard";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Search = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}`
      );
      setBooks(response.data.items || []);
    } catch (err) {
      setBooks([]);
    }
    setLoading(false);
  };

  return (
    <div className="search-page">
      <h1>Book Search</h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      <div className="results-section">
        {books.length > 0 ? (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} info={book.volumeInfo} volumeId={book.id} />
            ))}
          </div>
        ) : (
          <p className="no-results">{loading ? "" : "No results found."}</p>
        )}
      </div>
    </div>
  );
};

export default Search;