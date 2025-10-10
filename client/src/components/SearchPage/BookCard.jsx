import React from "react";
import "../../styles/SearchPage/BookCard.css";

const BookCard = ({ info }) => (
  <div className="book-card">
    <img
      src={info.imageLinks?.thumbnail || "/default-book.png"}
      alt={info.title}
      className="book-image"
    />
    <div className="book-details">
      <h3 className="book-title">{info.title}</h3>
      <p className="book-authors">
        {info.authors ? info.authors.join(", ") : "Unknown Author"}
      </p>
      <p className="book-date">{info.publishedDate}</p>
    </div>
  </div>
);

export default BookCard;