import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/BookInfoPage/BookInfo.css";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const BookInfo = () => {
  const { volumeId } = useParams();
  const [book, setBook] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${GOOGLE_BOOKS_API_KEY}`
        );
        const data = await res.json();
        setBook(data);
      } catch (err) {
        setBook(null);
      }
    };
    fetchBook();
  }, [volumeId]);

  if (!book) {
    return <div className="bookinfo-loading">Loading...</div>;
  }

  const info = book.volumeInfo || {};
  let img = `https://books.google.com/books/content?id=${volumeId}&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs-api`;

  return (
    <div className="bookinfo-container">
      <div className="bookinfo-main">
        <div className="bookinfo-image-section">
          <img
            src={img}
            alt={info.title}
            className="bookinfo-image"
          />
        </div>
        <div className="bookinfo-details-section">
          <h1 className="bookinfo-title">{info.title}</h1>
          <p className="bookinfo-author">
            <strong>Author:</strong> {info.authors ? info.authors.join(", ") : "Unknown"}
          </p>
          <p className="bookinfo-date">
            <strong>Published:</strong> {info.publishedDate || "Unknown"}
          </p>
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
              <span className="down-arrow">&#x25BC;</span>
            </button>
          )}
          {expanded && (
            <button
              className="bookinfo-summary-close"
              onClick={() => setExpanded(false)}
              aria-label="Collapse summary"
            >
              Close Summary
            </button>
          )}
          <button className="bookinfo-add-btn">Add to Bookshelf</button>
        </div>
      </div>
      <div className="bookinfo-reviews-section">
        <h2>Reviews</h2>
        <div className="bookinfo-reviews-list">
          <p>No reviews for this book</p>
        </div>
      </div>
    </div>
  );
};

export default BookInfo;