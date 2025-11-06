import React, { useState } from "react";
import { addBookToBookshelf } from "../../api";
import { useNavigate } from "react-router-dom";
import "../../styles/ProfilePage/BookShelfCard.css";

const BookCard = ({ info, volumeId }) => {
  const [saved, setSaved] = useState(false);
  const email = localStorage.getItem("userEmail"); // Store user email in localStorage on login
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate(`/book/${volumeId}`);
  };

  return (
    <div
      className="book-card"
      onClick={handleClick}
      tabIndex={0}
      role="button"
    >
      <img
        src={
          info.imageLinks?.thumbnail ||
          info.imageLinks?.smallThumbnail ||
          "/default-book.png"
        }
        alt={info.title}
        className="book-image"
      />
      <div className="book-details">
        <h3 className="book-title">{info.title}</h3>
        {/* <p className="book-authors">
          {info.authors ? info.authors.join(", ") : "Unknown Author"}
        </p> */}
        <p className="book-date">{info.publishedDate}</p>
      </div>
    </div>
  );
};

export default BookCard;