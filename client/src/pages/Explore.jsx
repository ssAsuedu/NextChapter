import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BookCard from "../components/ExplorePage/ExploreCard";
import "../styles/ExplorePage/Explore.css";
import { getBookshelf, addBookToBookshelf } from "../api"; // Import bookshelf API
import { createPortal } from "react-dom";

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
  const [hoveredCard, setHoveredCard] = useState(null); // { volumeId, coords, info }
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

  // Fetch books for each category
  useEffect(() => {
    categories.forEach(async (cat) => {
      setLoading((prev) => ({ ...prev, [cat.label]: true }));
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

  return (
    <div className="explore-page">
      <h1>Explore Books</h1>
      {categories.map((cat) => (
        <div key={cat.label} className="category-section">
          <h2 className="category-title">{cat.label}</h2>
          <div className="category-scroll-wrapper">
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
                <div className="category-loading">Loading...</div>
              ) : booksByCategory[cat.label]?.length > 0 ? (
                booksByCategory[cat.label].map((book) => (
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
                <div className="category-loading">No books found.</div>
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
            >
              {bookshelf.includes(hoveredCard.volumeId)
                ? "Saved"
                : "Save to Bookshelf"}
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Explore;