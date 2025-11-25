// filepath: /src/components/SearchPage/BookCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addBookToBookshelf } from "../../api";
import "../../styles/SearchPage/BookCard.css";

const BookCard = ({ info, volumeId }) => {
  const [saved, setSaved] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);

  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const title = info.title || "No Title Available";
  const titleWords = title.split(" ");
  const isLongTitle = titleWords.length > 20;
  const shortTitle = isLongTitle ? titleWords.slice(0, 12).join(" ") + "..." : title;

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
      style={{ cursor: "pointer" }}
    >
      <img
        src={info.imageLinks?.thumbnail || "/default-book.png"}
        alt={title}
        className="search-book-image"
      />

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

      <button
        className="search-save-btn"
        onClick={handleSave}
        disabled={saved}
      >
        {saved ? "Saved" : "Save to Bookshelf"}
      </button>
    </div>
  );
};

export default BookCard;
