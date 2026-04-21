import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../styles/SearchPage/Search.css";
import BookCard from "../components/SearchPage/BookCard";
import { getSearchFromCache, setSearchInCache } from "../../utils/apiCache";
import { searchGoogleVolumes, getBookshelf } from "../api";
//const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Search = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [bookshelf, setBookshelf] = useState([]);

  // Fetch bookshelf ONCE on mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;
    getBookshelf(email)
      .then((res) => setBookshelf(res.data.bookshelf || []))
      .catch(() => setBookshelf([]));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);

    try {
      // 1) check cache first
      const cached = getSearchFromCache(query);
      if (cached) {
        setBooks(cached);
        setSelectedGenre("");
        const allGenres = cached.flatMap(
          (b) => b.volumeInfo?.categories || []
        );
        setGenres([...new Set(allGenres)]);
        setLoading(false);
        return;
      }

      // 2) fallback to Google Books
      const response = await searchGoogleVolumes(query, 20);
      const fetchedBooks = response.data.items || [];
      setBooks(fetchedBooks);
      setSelectedGenre("");

      const allGenres = fetchedBooks.flatMap(
        (b) => b.volumeInfo?.categories || []
      );
      setGenres([...new Set(allGenres)]);

      // 3) store in cache
      setSearchInCache(query, fetchedBooks);
    } catch (err) {
      setBooks([]);
      setGenres([]);
      setSelectedGenre("");
    }

    setLoading(false);
  };

  const filteredBooks = useMemo(() => {
    let result = books;

    if (selectedGenre) {
      result = result.filter((b) =>
        b.volumeInfo?.categories?.includes(selectedGenre)
      );
    }

    if (sortBy === "title") {
      result = [...result].sort((a, b) =>
        (a.volumeInfo?.title || "").localeCompare(b.volumeInfo?.title || "")
      );
    } else if (sortBy === "newest") {
      result = [...result].sort((a, b) =>
        (b.volumeInfo?.publishedDate || "").localeCompare(
          a.volumeInfo?.publishedDate || ""
        )
      );
    } else if (sortBy === "oldest") {
      result = [...result].sort((a, b) =>
        (a.volumeInfo?.publishedDate || "").localeCompare(
          b.volumeInfo?.publishedDate || ""
        )
      );
    }

    return result;
  }, [books, selectedGenre, sortBy]);

  const clearFilters = () => {
    setSelectedGenre("");
    setSortBy("relevance");
    setShowAllGenres(false);
  };

  const hasActiveFilters = selectedGenre || sortBy !== "relevance";

  const visibleGenres = showAllGenres ? genres : genres.slice(0, 3);
  const hasMoreGenres = genres.length > 3;

  return (
    <div className="search-page" aria-label="Book search page">
      {/* Search Header */}
      <div className="search-header">
        <h1>Discover Books</h1>
        <p className="search-subtitle">
          Search millions of books and find your next great read
        </p>
        <form
          className="search-page-form"
          onSubmit={handleSearch}
          aria-label="Search for books"
        >
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-page-input"
              aria-label="Search books by title, author, or keyword"
            />
          </div>
          <button
            type="submit"
            className="browse-button"
            disabled={loading}
            aria-label={loading ? "Searching for books" : "Search for books"}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      {books.length > 0 && (
        <div
          className="search-content"
          aria-label="Search results and filter options"
        >
          {/* Mobile filter toggle */}
          <button
            className="filter-toggle-btn"
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-label="Toggle search filters"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
            Filters
            {hasActiveFilters && <span className="filter-badge" />}
          </button>

          {/* Filter Sidebar */}
          <aside
            className={`filter-pane ${filtersOpen ? "open" : ""}`}
            aria-label="Search filters panel"
          >
            <div className="filter-pane-header">
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button
                  className="clear-filters-btn"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort By */}
            <div className="filter-section">
              <h4 className="filter-label">Sort By</h4>
              <div className="filter-options">
                {[
                  { value: "relevance", label: "Relevance" },
                  { value: "title", label: "Title A–Z" },
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`filter-chip ${
                      sortBy === option.value ? "active" : ""
                    }`}
                    onClick={() => setSortBy(option.value)}
                    aria-label={`Sort results by ${option.label}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            {genres.length > 0 && (
              <div className="filter-section">
                <h4 className="filter-label">Genre</h4>
                <div className="filter-options">
                  <button
                    className={`filter-chip ${
                      !selectedGenre ? "active" : ""
                    }`}
                    onClick={() => setSelectedGenre("")}
                    aria-label="Show books from all genres"
                  >
                    All Genres
                  </button>
                  {visibleGenres.map((genre, idx) => (
                    <button
                      key={idx}
                      className={`filter-chip ${
                        selectedGenre === genre ? "active" : ""
                      }`}
                      onClick={() => setSelectedGenre(genre)}
                      aria-label={
                        selectedGenre === genre
                          ? `Filter by genre ${genre}, selected`
                          : `Filter by genre ${genre}`
                      }
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {hasMoreGenres && (
                  <button
                    type="button"
                    className="view-more-genres-btn"
                    onClick={() => setShowAllGenres(!showAllGenres)}
                  >
                    {showAllGenres ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            )}

            {/* Results count */}
            <div
              className="filter-results-count"
              aria-label={`${filteredBooks.length} books found`}
            >
              {filteredBooks.length}{" "}
              {filteredBooks.length === 1 ? "book" : "books"} found
            </div>
          </aside>

          {/* Overlay for mobile */}
          {filtersOpen && (
            <div
              className="filter-overlay"
              onClick={() => setFiltersOpen(false)}
            />
          )}

          {/* Books Grid */}
          <div
            className="results-section"
            aria-label="Books matching your search and filters"
          >
            {filteredBooks.length > 0 ? (
              <div className="books-grid">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    info={book.volumeInfo}
                    volumeId={book.id}
                    bookshelf={bookshelf}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results-container">
                <p className="no-results">
                  No books match your current filters.
                </p>
                <button
                  className="clear-filters-link"
                  onClick={clearFilters}
                  aria-label="Clear filters to show all results"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty / initial state */}
      {books.length === 0 && !loading && (
        <p
          className="no-results"
          aria-label="No search results or initial search state message"
        >
          {query ? "No results found. Try a different search." : ""}
        </p>
      )}

      {loading && (
        <div className="loading-container" aria-label="Searching for books">
          <div className="loading-spinner" />
          <p>Searching for books...</p>
        </div>
      )}
    </div>
  );
};

export default Search;