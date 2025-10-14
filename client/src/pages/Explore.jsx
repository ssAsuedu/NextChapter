import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BookCard from "../components/SearchPage/BookCard";
import "../styles/ExplorePage/Explore.css";

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
  const scrollRefs = useRef({});

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
                  <BookCard key={book.id} info={book.volumeInfo} />
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
    </div>
  );
};

export default Explore;