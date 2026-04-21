import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/ExplorePage/ExploreCard";
import "../styles/ExplorePage/Explore.css";
import { getGoogleVolume, searchGoogleVolumes } from "../api";
import {
  getBookshelf,
  addBookToBookshelf,
  getTrendingBooks,
  getNotInterestedBooks,
  addNotInterestedBook,
} from "../api";
import { createPortal } from "react-dom";
import {
  getSearchFromCache,
  setSearchInCache,
  getBookFromCache,
  setBookInCache,
} from "../../utils/apiCache";
import { Link } from "react-router-dom";
import BookRating from "../components/BookRating";

//const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

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

// const SCROLL_AMOUNT = 600; // px to scroll per click

const Explore = () => {
  const [booksByCategory, setBooksByCategory] = useState({});
  const [loading, setLoading] = useState({});
  const [bookshelf, setBookshelf] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [notInterestedBooks, setNotInterestedBooks] = useState([]);

  const hiddenBookIds = new Set(notInterestedBooks.map(String));
  
  const [loginModal, setLoginModal] = useState(false);

  const scrollRefs = useRef({});
  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  function Modal({ loginModal }) {
    if (!loginModal) return null;
  }
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("login-modal-wrapper")) {
      setLoginModal(false);
    }
  };

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

    const fetchNotInterested = async () => {
      if (!email) return;
      try {
        const res = await getNotInterestedBooks(email);
        setNotInterestedBooks(res.data.notInterestedBooks || []);
      } catch {
        setNotInterestedBooks([]);
      }
    };

    fetchBookshelf();
    fetchNotInterested();
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

        // Fetch book details in parallel (no more sequential 200ms delays)
        const bookDetails = await Promise.all(
          trendingData.map(async (item) => {
            const cached = getBookFromCache(item.volumeId);
            if (cached) return { ...cached, readers: item.readers };
            try {
              const bookRes = await getGoogleVolume(item.volumeId);
              setBookInCache(item.volumeId, bookRes.data);
              return { ...bookRes.data, readers: item.readers };
            } catch {
              return null;
            }
          }),
        );
        setTrendingBooks(bookDetails.filter(Boolean));
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
        const response = await searchGoogleVolumes(cat.query, 12);
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
      const scrollBy = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "right" ? scrollBy : -scrollBy,
        behavior: "smooth",
      });
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
      setLoginModal(true);
      return;
    }
    try {
      await addBookToBookshelf({ email, volumeId });
      setBookshelf((prev) => [...prev, volumeId]);
    } catch {
      alert("Failed to save book.");
    }
  };

  const handleHideBook = async (volumeId) => {
    if (!email) {
    setLoginModal(true);
    return;
  }

    try {
      await addNotInterestedBook({ email, volumeId });
      setNotInterestedBooks((prev) =>
        prev.includes(volumeId) ? prev : [...prev, volumeId],
      );
      if (hoveredCard?.volumeId === volumeId) setHoveredCard(null);
    } catch {
      alert("Failed to hide book.");
    }
  };

  return (
    <div className="explore-page" role="main" aria-labelledby="explore-heading">
      <h1 id="explore-heading">Explore Books</h1>

      {/* Mood Finder CTA */}
      <div className="mood-cta-banner">
        <div className="mood-cta-text">
          <span>Not sure what to read? Let your mood decide.</span>
        </div>
        <button className="mood-cta-btn" onClick={() => navigate("/mood")}>
          Explore Based on My Mood
        </button>
      </div>

      {/* ===== TRENDING SECTION ===== */}
      <div
        className="category-section section-container"
        role="region"
        aria-labelledby="trending-heading"
      >
        <h2 className="trending-title" id="trending-heading">
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
                .filter((book) => !hiddenBookIds.has(book.id))
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
                    <p className="book-title-display">
                      {book.volumeInfo?.title}
                    </p>
                    <p className="book-author-display">
                      {book.volumeInfo?.authors?.length
                        ? book.volumeInfo.authors.join(", ")
                        : "Unknown Author"}
                    </p>
                    <BookRating
                      volumeId={book.id}
                      showRatingValue={false}
                      showNoRatings={false}
                      preloadedReviews={[]}
                    />
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
          className="category-section section-container"
          role="region"
          aria-labelledby={`${cat.label.toLowerCase()}-heading`}
        >
          <h2
            className="trending-title"
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
                  .filter((book) => !hiddenBookIds.has(book.id))
                  .map((book) => (
                    <div key={book.id} className="book-item-display">
                      <BookCard
                        key={book.id}
                        info={book.volumeInfo}
                        volumeId={book.id}
                        bookshelf={bookshelf}
                        onMouseEnter={handleCardMouseEnter}
                        onMouseLeave={handleCardMouseLeave}
                        isHovered={hoveredCard?.volumeId === book.id}
                      />
                      <p className="book-title-display">
                        {book.volumeInfo?.title}
                      </p>
                      <p className="book-author-display">
                        {book.volumeInfo?.authors?.length
                          ? book.volumeInfo.authors.join(", ")
                          : "Unknown Author"}
                      </p>
                      <BookRating
                        volumeId={book.id}
                        showRatingValue={false}
                        showNoRatings={false}
                        preloadedReviews={[]}
                      />
                    </div>
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
          document.body,
        )}
      {loginModal && (
        <div className="login-modal-wrapper" onClick={handleOutsideClick}>
          <div className="login-modal-content">
            <div className="login-modal-title">
              <h1>Login Required</h1>
              <p>Please login to save this book to your bookshelf.</p>
            </div>
            <div className="button-display">
              <Link to="/login" className="login-btn-display">
                Login
              </Link>
              <button
                className="close-btn-display"
                onClick={() => setLoginModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;