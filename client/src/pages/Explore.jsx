import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BookCard from "../components/ExplorePage/ExploreCard";
import "../styles/ExplorePage/Explore.css";
import { getBookshelf, addBookToBookshelf, getTrendingBooks } from "../api";
import { createPortal } from "react-dom";
import { getSearchFromCache, setSearchInCache, getBookFromCache, setBookInCache } from "../../utils/apiCache";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

// Define categories and their search terms
const categories = [
  { label: "Fiction", query: "subject:fiction" },
  { label: "Science", query: "subject:science" },
  { label: "History", query: "subject:history" },
  { label: "Fantasy", query: "subject:fantasy" },
  { label: "Biography", query: "subject:biography" },
  { label: "Mystery", query: "subject:mystery" },
  { label: "Romance", query: "subject:romance" },
];

const SCROLL_AMOUNT = 600; // px to scroll per click

const Explore = () => {
  const [booksByCategory, setBooksByCategory] = useState({});
  const [loading, setLoading] = useState({});
  const [bookshelf, setBookshelf] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [hiddenBooks, setHiddenBooks] = useState([]);
  const scrollRefs = useRef({});
  const email = localStorage.getItem("userEmail");

  // Fetch user's bookshelf once on mount
  useEffect(() => {
    const fetchBookshelf = async () => {
      if (!email) return;
      try {
        const res = await getBookshelf(email);
        setBookshelf(res.data.bookshelf || []);
      } catch {
        setBookshelf([]);
      }
    };
    fetchBookshelf();
  }, [email]);

  // Fetch trending books
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true);
      try {
        const res = await getTrendingBooks(12);
        const trendingData = res.data.trending || [];

        if (trendingData.length === 0) {
          setTrendingBooks([]);
          setTrendingLoading(false);
          return;
        }

        // Fetch book details from Google Books API for each trending volumeId
        const bookDetails = [];
        for (const item of trendingData) {
          let book = getBookFromCache(item.volumeId);
          if (book) {
            bookDetails.push({ ...book, readers: item.readers });
          } else {
            try {
              const bookRes = await axios.get(
                `https://www.googleapis.com/books/v1/volumes/${item.volumeId}?key=${GOOGLE_BOOKS_API_KEY}`
              );
              setBookInCache(item.volumeId, bookRes.data);
              bookDetails.push({ ...bookRes.data, readers: item.readers });
              await new Promise((r) => setTimeout(r, 200)); // throttle
            } catch {
              // Skip books that fail to load
            }
          }
        }
        setTrendingBooks(bookDetails);
      } catch {
        setTrendingBooks([]);
      }
      setTrendingLoading(false);
    };
    fetchTrending();
  }, []);

  // Fetch books for each category
  useEffect(() => {
    categories.forEach(async (cat) => {
      setLoading((prev) => ({ ...prev, [cat.label]: true }));

      // Check cache first
      const cached = getSearchFromCache(cat.query);
      if (cached) {
        setBooksByCategory((prev) => ({
          ...prev,
          [cat.label]: cached,
        }));
        setLoading((prev) => ({ ...prev, [cat.label]: false }));
        return;
      }

      // If not cached, fetch from API
      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            cat.query
          )}&maxResults=12&key=${GOOGLE_BOOKS_API_KEY}`
        );
        setBooksByCategory((prev) => ({
          ...prev,
          [cat.label]: response.data.items || [],
        }));
        setSearchInCache(cat.query, response.data.items || []);
      } catch {
        setBooksByCategory((prev) => ({
          ...prev,
          [cat.label]: [],
        }));
      }
      setLoading((prev) => ({ ...prev, [cat.label]: false }));
    });
  }, []);

  const handleScroll = (catLabel, direction) => {
    const container = scrollRefs.current[catLabel];
    if (container) {
      const scrollBy = direction === "right" ? SCROLL_AMOUNT : -SCROLL_AMOUNT;
      container.scrollBy({ left: scrollBy, behavior: "smooth" });
    }
  };

  const handleCardMouseEnter = (volumeId, info, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCard({
      volumeId,
      info,
      coords: {
        top: rect.top - 120,
        left: rect.left + rect.width / 2,
      },
    });
  };

  const handleCardMouseLeave = () => {
    setHoveredCard(null);
  };

  const handleSaveBook = async (volumeId) => {
    if (!email) {
      alert("Please log in to save books.");
      return;
    }
    try {
      await addBookToBookshelf({ email, volumeId });
      setBookshelf((prev) => [...prev, volumeId]);
    } catch {
      alert("Failed to save book.");
    }
  };

  const handleHideBook = (volumeId) => {
    setHiddenBooks((prev) => (prev.includes(volumeId) ? prev : [...prev, volumeId]));
    if (hoveredCard?.volumeId === volumeId) setHoveredCard(null);
  };

  return (
    <div
      className="explore-page"
      role="main"
      aria-labelledby="explore-heading"
    >
      <h1 id="explore-heading">Explore Books</h1>

      {/* ===== TRENDING SECTION ===== */}
      <div
        className="category-section trending-section"
        role="region"
        aria-labelledby="trending-heading"
      >
        <h2
          className="category-title trending-title"
          id="trending-heading"
        >
           Trending with Readers
        </h2>
        <div
          className="category-scroll-wrapper"
          aria-label="Trending books horizontal list"
        >
          <button
            className="scroll-btn left"
            aria-label="Scroll Trending left"
            onClick={() => handleScroll("Trending", "left")}
          >
            &#8249;
          </button>
          <div
            className="category-scroll"
            ref={(el) => (scrollRefs.current["Trending"] = el)}
          >
            {trendingLoading ? (
              <div
                className="category-loading"
                role="status"
                aria-live="polite"
              >
                Loading trending books...
              </div>
            ) : trendingBooks.length > 0 ? (
              trendingBooks
                .filter((book) => !hiddenBooks.includes(book.id))
                .map((book) => (
                  <div
                    key={book.id}
                    className="trending-card-wrapper"
                    aria-label={`Trending book: ${book.volumeInfo?.title || "Untitled"}`}
                  >
                    <BookCard
                      info={book.volumeInfo}
                      volumeId={book.id}
                      bookshelf={bookshelf}
                      onMouseEnter={handleCardMouseEnter}
                      onMouseLeave={handleCardMouseLeave}
                      isHovered={hoveredCard?.volumeId === book.id}
                    />
                    <span className="trending-reader-count">
                      {book.readers} {book.readers === 1 ? "reader" : "readers"}
                    </span>
                  </div>
                ))
            ) : (
              <div
                className="category-loading"
                role="status"
                aria-live="polite"
              >
                No trending books yet — be the first to add books to your shelf!
              </div>
            )}
          </div>
          <button
            className="scroll-btn right"
            aria-label="Scroll Trending right"
            onClick={() => handleScroll("Trending", "right")}
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* ===== CATEGORY SECTIONS ===== */}
      {categories.map((cat) => (
        <div
          key={cat.label}
          className="category-section"
          role="region"
          aria-labelledby={`${cat.label.toLowerCase()}-heading`}
        >
          <h2
            className="category-title"
            id={`${cat.label.toLowerCase()}-heading`}
          >
            {cat.label}
          </h2>
          <div
            className="category-scroll-wrapper"
            aria-label={`${cat.label} books horizontal list`}
          >
            <button
              className="scroll-btn left"
              aria-label={`Scroll ${cat.label} left`}
              onClick={() => handleScroll(cat.label, "left")}
            >
              &#8249;
            </button>
            <div
              className="category-scroll"
              ref={(el) => (scrollRefs.current[cat.label] = el)}
            >
              {loading[cat.label] ? (
                <div
                  className="category-loading"
                  role="status"
                  aria-live="polite"
                >
                  Loading...
                </div>
              ) : booksByCategory[cat.label]?.length > 0 ? (
                booksByCategory[cat.label]
                  .filter((book) => !hiddenBooks.includes(book.id))
                  .map((book) => (
                    <BookCard
                      key={book.id}
                      info={book.volumeInfo}
                      volumeId={book.id}
                      bookshelf={bookshelf}
                      onMouseEnter={handleCardMouseEnter}
                      onMouseLeave={handleCardMouseLeave}
                      isHovered={hoveredCard?.volumeId === book.id}
                    />
                  ))
              ) : (
                <div
                  className="category-loading"
                  role="status"
                  aria-live="polite"
                >
                  No books found.
                </div>
              )}
            </div>
            <button
              className="scroll-btn right"
              aria-label={`Scroll ${cat.label} right`}
              onClick={() => handleScroll(cat.label, "right")}
            >
              &#8250;
            </button>
          </div>
        </div>
      ))}

      {/* Portal popup outside the scroll container */}
      {hoveredCard &&
        createPortal(
          <div
            className="book-popup"
            style={{
              position: "fixed",
              top: hoveredCard.coords.top,
              left: hoveredCard.coords.left,
              transform: "translate(-50%, 0)",
              zIndex: 9999,
            }}
            onMouseLeave={handleCardMouseLeave}
            onMouseEnter={() => setHoveredCard(hoveredCard)}
            role="dialog"
            aria-modal="false"
            aria-label={`Details for ${hoveredCard.info.title}`}
          >
            <h3 className="book-title">{hoveredCard.info.title}</h3>
            <p className="book-authors">
              {hoveredCard.info.authors
                ? hoveredCard.info.authors.join(", ")
                : "Unknown Author"}
            </p>
            <button
              className="save-book-btn"
              onClick={() => handleSaveBook(hoveredCard.volumeId)}
              disabled={bookshelf.includes(hoveredCard.volumeId)}
              aria-label={
                bookshelf.includes(hoveredCard.volumeId)
                  ? "Book already saved to your bookshelf"
                  : "Save this book to your bookshelf"
              }
            >
              {bookshelf.includes(hoveredCard.volumeId)
                ? "Saved"
                : "Save to Bookshelf"}
            </button>

            <button
              className="hide-book-btn"
              onClick={() => handleHideBook(hoveredCard.volumeId)}
              aria-label="Hide this book from Explore recommendations"
            >
              Not Interested
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Explore;