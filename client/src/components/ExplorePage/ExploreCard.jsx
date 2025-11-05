import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { addBookToBookshelf } from "../../api";
import "../../styles/ExplorePage/ExploreCard.css";

const BookCard = ({
  info,
  volumeId,
  bookshelf = [],
  onMouseEnter,
  onMouseLeave,
  isHovered,
}) => {
  const email = localStorage.getItem("userEmail");
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const closeTimeout = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    setSaved(bookshelf.includes(volumeId));
  }, [bookshelf, volumeId]);

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

  // Get position for popup
  const handleMouseEnter = (e) => {
    clearTimeout(closeTimeout.current);
    setHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      top: rect.top - 120,
      left: rect.left + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setHovered(false), 100);
  };

  const handlePopupMouseEnter = () => {
    clearTimeout(closeTimeout.current);
    setHovered(true);
  };

  const handlePopupMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setHovered(false), 100);
  };

  const handleClick = () => {
    navigate(`/book/${volumeId}`);
  };

  return (
    <>
      <div
        className="book-card"
        onMouseEnter={(e) => onMouseEnter(volumeId, info, e)}
        onMouseLeave={onMouseLeave}
        tabIndex={0}
        style={{ position: "relative" }}
        onClick={handleClick}
        role="button"
      >
        <img
          src={info.imageLinks?.thumbnail || "/default-book.png"}
          alt={info.title}
          className="book-image"
        />
      </div>
      {hovered &&
        createPortal(
          <div
            className="book-popup"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, 0)",
              zIndex: 9999,
            }}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <h3 className="book-title">{info.title}</h3>
            <p className="book-authors">
              {info.authors ? info.authors.join(", ") : "Unknown Author"}
            </p>
            <button
              className="save-book-btn"
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? "Saved" : "Save to Bookshelf"}
            </button>
          </div>,
          document.body
        )}
    </>
  );
};

export default BookCard;