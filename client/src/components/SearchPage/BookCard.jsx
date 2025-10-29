import React, { useState } from "react";
import { addBookToBookshelf } from "../../api";
import "../../styles/SearchPage/BookCard.css";

const BookCard = ({ info, volumeId }) => {
  const [saved, setSaved] = useState(false);
  const email = localStorage.getItem("userEmail");

  const handleSave = async () => {
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

  return (
    <div className="search-book-card">
      <img
        src={info.imageLinks?.thumbnail || "/default-book.png"}
        alt={info.title}
        className="search-book-image"
      />
      <div className="search-book-details">
        <h3 className="search-book-title">{info.title}</h3>
        <p className="search-book-authors">
          {info.authors ? info.authors.join(", ") : "Unknown Author"}
        </p>
        <p className="search-book-date">{info.publishedDate}</p>
        <button
          className="search-save-btn"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? "Saved" : "Save to Bookshelf"}
        </button>
      </div>
    </div>
  );
};

export default BookCard;