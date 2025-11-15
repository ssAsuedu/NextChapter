import React, { useEffect, useState } from "react";
import { getBookshelf } from "../api";
import axios from "axios";
import BookCard from "../components/ProfilePage/BookShelfCard";
import "../styles/ProfilePage/Profile.css";
import ProfileNavbar from "../components/ProfilePage/ProfileNavbar";
import ProfileLogo from "../assets/profile2.svg";
import { getBookFromCache, setBookInCache } from "../../utils/apiCache";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const userCreatedAt = localStorage.getItem("userCreatedAt");
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
      const results = [];
      for (const id of bookshelf) {
        let book = getBookFromCache(id);
        if (book) {
          results.push(book);
        } else {
          try {
            const res = await axios.get(
              `https://www.googleapis.com/books/v1/volumes/${id}?key=${GOOGLE_BOOKS_API_KEY}`
            );
            setBookInCache(id, res.data);
            results.push(res.data);
            await new Promise(r => setTimeout(r, 200)); // throttle
          } catch (e) {
            // handle error
          }
        }
      }
      setBooks(results);
    };
    fetchBookDetails();
  }, [bookshelf]);

  const formattedDate = userCreatedAt
    ? new Date(userCreatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : "N/A";

  return (
    <div className="profile-page">
      <ProfileNavbar />
      {/* Top Profile Section */}
      <div className="profile-top-section">
        <div className="profile-logo-container">
          <img src={ProfileLogo} alt="Profile Logo" className="profile-logo" />
        </div>
        <div className="profile-info">
          <h2 className="profile-username">{userName || "User"}</h2>
          <p className="profile-created">Joined: {formattedDate}</p>
          <p className="profile-followers">Followers: 0</p>
        </div>
      </div>
      {/* Bookshelf Section */}
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