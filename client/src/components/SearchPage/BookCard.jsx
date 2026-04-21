// filepath: /src/components/SearchPage/BookCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addBookToBookshelf } from "../../api";
import "../../styles/SearchPage/BookCard.css";

const BookCard = ({ info, volumeId, bookshelf = [] }) => {
  const [saved, setSaved] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);

  const cover = `https://books.google.com/books/content/images/frontcover/${volumeId}?fife=w400-h600&source=gbs_api`;
  const fallback = info.imageLinks?.thumbnail ||
  info.imageLinks?.smallThumbnail ||
  "/default-book.png";

  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const title = info.title || "No Title Available";
  const titleWords = title.split(" ");
  const isLongTitle = titleWords.length > 8;
  
  const shortTitle = isLongTitle
    ? titleWords.slice(0, 8).join(" ") + "..."
    : title;

  const isOnShelf = saved || bookshelf.includes(volumeId);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!email) {
      alert("Please log in to save books.");
      return;
    }
    try {
      await addBookToBookshelf({ email, volumeId });
      setSaved(true);
    } catch {
      alert("Failed to save book.");
    }
  };

  const handleClick = () => {
    navigate(`/book/${volumeId}`);
  };

  return (
    <div
      className="search-book-card"
      onClick={handleClick}
      tabIndex={0}
      role="button"
    >
      <img
        src={cover}
        onError={(e) => {
          e.target.src = fallback;
        }}
        alt={title}
        className="search-book-image"
      />

      <div className="title-author-wrapper">
        <h3 className="search-book-title">
          {showFullTitle || !isLongTitle ? title : shortTitle}
          {isLongTitle && (
            <span
              className="see-more-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullTitle(!showFullTitle);
              }}
            >
              {showFullTitle ? "See less" : "See more"}
            </span>
          )}
        </h3>

        <p className="search-book-authors">
          {info.authors ? info.authors.join(", ") : "Unknown Author"}
        </p>
      </div>

      <button
        className="search-save-btn"
        onClick={handleSave}
        disabled={isOnShelf}
      >
        {isOnShelf ? "Saved" : "Save to Bookshelf"}
      </button>
    </div>
  );
};

export default BookCard;