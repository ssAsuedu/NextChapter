// filepath: /src/components/SearchPage/BookCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBookshelf, addBookToBookshelf } from "../../api";
import "../../styles/SearchPage/BookCard.css";

const BookCard = ({ info, volumeId }) => {
  const [saved, setSaved] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [bookshelf, setBookshelf] = useState([]);

  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const title = info.title || "No Title Available";
  const titleWords = title.split(" ");
  const isLongTitle = titleWords.length > 8;
  const shortTitle = isLongTitle
    ? titleWords.slice(0, 8).join(" ") + "..."
    : title;

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!email) {
      alert("Please log in to save books.");
      return;
    }
    try {
      await addBookToBookshelf({ email, volumeId });
      setSaved(true);
      setBookshelf((prev) => [...prev, volumeId]);
    } catch {
      alert("Failed to save book.");
    }
  };

  const handleClick = () => {
    navigate(`/book/${volumeId}`);
  };

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

  return (
    <div
      className="search-book-card"
      onClick={handleClick}
      tabIndex={0}
      role="button"
    >
      <img
        src={info.imageLinks?.thumbnail || "/default-book.png"}
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
        disabled={bookshelf.includes(volumeId)}
      >
        {bookshelf.includes(volumeId) ? "Saved" : "Save to Bookshelf"}
      </button>
    </div>
  );
};

export default BookCard;