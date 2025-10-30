import React, { useState } from "react";
import { addBookToBookshelf } from "../../api";
import "../../styles/ProfilePage/BookShelfCard.css";

const BookCard = ({ info, volumeId }) => {
  const [saved, setSaved] = useState(false);
  const email = localStorage.getItem("userEmail"); // Store user email in localStorage on login

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
    <div className="book-card">
      <img
        src={info.imageLinks?.thumbnail || "/default-book.png"}
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