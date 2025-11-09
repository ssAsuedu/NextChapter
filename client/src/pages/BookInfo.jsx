import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/BookInfoPage/BookInfo.css";
import { getBookFromCache, setBookInCache } from "../../utils/apiCache";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { getBookReviews, getBookshelf, addBookToBookshelf, deleteBookFromBookshelf } from "../api";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const BookInfo = () => {
  const { volumeId } = useParams();
  const [book, setBook] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [genresExpanded, setGenresExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [bookshelf, setBookshelf] = useState([]);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchBook = async () => {
      const cached = getBookFromCache(volumeId);
      if (cached) {
        setBook(cached);
        return;
      }
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${GOOGLE_BOOKS_API_KEY}`
        );
        const data = await res.json();
        setBookInCache(volumeId, data);
        setBook(data);
      } catch (err) {
        setBook(null);
      }
    };
    fetchBook();
  }, [volumeId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getBookReviews(volumeId);
        setReviews(res.data.reviews || []);
      } catch {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [volumeId]);

  useEffect(() => {
    const fetchShelf = async () => {
      if (!email) return;
      try {
        const res = await getBookshelf(email);
        setBookshelf(res.data.bookshelf || []);
      } catch {
        setBookshelf([]);
      }
    };
    fetchShelf();
  }, [email]);

  const isBookInShelf = bookshelf.includes(volumeId);

  const handleAddToBookshelf = async () => {
    if (!email) {
      alert("Please log in to add books.");
      return;
    }
    try {
      await addBookToBookshelf({ email, volumeId });
      setBookshelf(prev => [...prev, volumeId]);
      if (book) setBookInCache(volumeId, book);
    } catch {
      alert("Failed to add book.");
    }
  };

  const handleRemoveFromBookshelf = async () => {
    if (!email) {
      alert("Please log in to remove books.");
      return;
    }
    try {
      await deleteBookFromBookshelf({ email, volumeId });
      setBookshelf(prev => prev.filter(id => id !== volumeId));
    } catch {
      alert("Failed to remove book.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? "var(--primary-color)" : "#e0d6f7",
            fontSize: "1.3rem",
            marginRight: "2px",
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (!book) {
    return <div className="bookinfo-loading">Loading...</div>;
  }

  const info = book.volumeInfo || {};
  let img = `https://books.google.com/books/content?id=${volumeId}&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs-api`;

  return (
    <div className="bookinfo-container">
      <div className="bookinfo-main-wrapper">
        <div className="bookinfo-main">
          <div className="bookinfo-image-section">
            <img
              src={img}
              alt={info.title}
              className="bookinfo-image"
            />
          </div>
        <div className="bookinfo-details-section">
          <div className="bookinfo-title-row">
            <h1 className="bookinfo-title">{info.title}</h1>
            {isBookInShelf ? (
              <button
                className="bookinfo-add-btn bookinfo-in-shelf"
                onClick={handleRemoveFromBookshelf}
              >
                Remove from Bookshelf
              </button>
            ) : (
              <button
                className="bookinfo-add-btn"
                onClick={handleAddToBookshelf}
              >
                Add to Bookshelf
              </button>
            )}
          </div>
          <div className="bookinfo-details-text">
            <p>
              <strong>Author:</strong> {info.authors ? info.authors.join(", ") : "Unknown"}
            </p>
            <p>
              <strong>Genre(s):</strong>{" "}
              {info.categories ? (
                <>
                  {genresExpanded
                    ? info.categories.join(", ") // show all genres
                    : info.categories.slice(0, 2).join(", ") // show first 2
                  }
                  {info.categories.length > 2 && (
                    <button
                      onClick={() => setGenresExpanded(!genresExpanded)}
                      className="genre-toggle"
                    >
                      {genresExpanded ? "Show less" : `+${info.categories.length - 2} more`}
                    </button>
                  )}
                </>
              ) : (
                "Unknown"
              )}
            </p>
            <p>
              <strong>Published:</strong> {info.publishedDate || "Unknown"}
            </p>
          </div>
          <div className={`bookinfo-summary-expandable${expanded ? " expanded" : ""}`}>
            <strong>Summary:</strong>{" "}
            {info.description ? (
              <span
                dangerouslySetInnerHTML={{ __html: info.description }}
              />
            ) : (
              "No summary available."
            )}
          </div>
          {!expanded && info.description && (
            <button
              className="bookinfo-summary-toggle"
              onClick={() => setExpanded(true)}
              aria-label="Expand summary"
            >
              <ArrowDropDownIcon fontSize="large"/>
            </button>
          )}
          {expanded && (
              <button
                className="bookinfo-summary-close"
                onClick={() => setExpanded(false)}
                aria-label="Collapse summary"
              >
                <ArrowDropUpIcon fontSize="large" />
              </button>
            )}
          </div>
        </div>
      </div>
      <h2
        style={{
          color: "#6c3fc5",
          fontSize: "1.6rem",
          fontWeight: "700",
          marginBottom: "4px",
          marginTop: "64px",
        }}
      >
        Reviews
      </h2>
      <p
      style={{
        color: "#7e7e7e",
        fontSize: "1rem",
        margin: "0 0 18px 4px",
      }}
      >
        Real reviews from passionate readers like you
      </p>
      <div className="bookinfo-reviews-section">
        <div className="bookinfo-reviews-list">
          {reviews.length === 0 ? (
            <p>No reviews for this book</p>
          ) : (
            reviews.map((r, idx) => (
              <div key={idx} className="bookinfo-review">
                <div className="bookinfo-review-content">
                  <strong>{r.name || r.email}</strong> -{" "}
                  {new Date(r.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
                <div className="bookinfo-review-content">
                  {renderStars(r.rating)}
                </div>
                <div className="bookinfo-review-content">{r.reviewText}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookInfo;