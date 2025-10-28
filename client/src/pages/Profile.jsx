import React, { useEffect, useState } from "react";
import { getBookshelf } from "../api";
import axios from "axios";
import BookCard from "../components/ProfilePage/BookShelfCard";
import "../styles/ProfilePage/Profile.css";
import ProfileNavbar from "../components/ProfilePage/ProfileNavbar"; // Import the new navbar

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const [bookshelf, setBookshelf] = useState([]);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBookshelf = async () => {
      if (!email) return;
      const res = await getBookshelf(email);
      setBookshelf(res.data.bookshelf || []);
    };
    fetchBookshelf();
  }, [email]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (bookshelf.length === 0) return;
      const promises = bookshelf.map(id =>
        axios.get(`https://www.googleapis.com/books/v1/volumes/${id}?key=${GOOGLE_BOOKS_API_KEY}`)
      );
      const results = await Promise.all(promises);
      setBooks(results.map(r => r.data));
    };
    fetchBookDetails();
  }, [bookshelf]);

  return (
    <div className="profile-page">
      <ProfileNavbar />
      <div className="profile-content">
        <h1>Your Bookshelf</h1>
        <div className="bookshelf-grid">
          {books.length > 0 ? (
            books.map(book => (
              <BookCard key={book.id} info={book.volumeInfo} volumeId={book.id} />
            ))
          ) : (
            <p>No books saved yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;