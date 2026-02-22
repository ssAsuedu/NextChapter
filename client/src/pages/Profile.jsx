import React, { useEffect, useState } from "react";
import { getBookshelf, getAllUsers, getFriends } from "../api";
import axios from "axios";
import BookCard from "../components/ProfilePage/BookShelfCard";
import "../styles/ProfilePage/Profile.css";
import ProfileLogo from "../assets/profile2.svg";
import { getBookFromCache, setBookInCache } from "../../utils/apiCache";
// badge import section below 
import HalfwayBadge from "../assets/HalfwayBadge.svg";
import JourneyComplete from "../assets/JourneyComplete.svg";
import NewChapter from "../assets/NewChapter.svg";
import FutureLibrarian from "../assets/FutureLibrarian.svg";
import CriticInTheMaking from "../assets/CriticInTheMaking.svg";
import { getBadges } from "../api";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Profile = () => {
  const userName = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const [bookshelf, setBookshelf] = useState([]);
  const [books, setBooks] = useState([]);
  const [createdAt, setCreatedAt] = useState(null);
  const [friendCount, setFriendCount] = useState(0);

  // badge state 
  const [badges, setBadges] = useState([]);
  // badge mapping to svgs 
  const badgeIcons = {
    HALFWAY: HalfwayBadge,
    FINISHED: JourneyComplete,
    NEW_CHAPTER: NewChapter,
    FUTURE_LIBRARIAN: FutureLibrarian,
    CRITIC_IN_THE_MAKING: CriticInTheMaking,
    NEW_CHAPTER: NewChapter,
  };

  useEffect(() => {
    const fetchBookshelf = async () => {
      if (!email) return;
      const res = await getBookshelf(email);
      setBookshelf(res.data.bookshelf || []);
    };
    fetchBookshelf();
  }, [email]);

  // fetch badge details 
  useEffect(() => {
    const fetchBadges = async () => {
      if (!email) return;
      const res = await getBadges(email);
      setBadges(res.data.badges);
    };

    fetchBadges();
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

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!email) return;
      try {
        // Get createdAt from all users
        const usersRes = await getAllUsers();
        const foundUser = usersRes.data.find(u => u.email === email);
        if (foundUser) {
          setCreatedAt(foundUser.createdAt);
        }
        // Get friend count using getFriends (same as Account.jsx)
        const friendsRes = await getFriends(email);
        setFriendCount(Array.isArray(friendsRes.data) ? friendsRes.data.length : 0);
      } catch (e) {
        setCreatedAt(null);
        setFriendCount(0);
      }
    };
    fetchUserInfo();
  }, [email]);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : "N/A";

  return (
    <div className="profile-page">
      {/* Top Profile Section */}
      <div className="profile-top-section">
        <div className="profile-logo-container">
          <img src={ProfileLogo} alt="Profile Logo" className="profile-logo" />
        </div>
        <div className="profile-info">
          <h2 className="profile-username">{userName || "User"}</h2>
          <p className="profile-created">Joined: {formattedDate}</p>
          <p className="profile-followers">Friends: {friendCount}</p>
          <div className="profile-badges-row">
            {badges.length === 0 ? (
              <p>No badges yet</p>
            ) : (
              badges.map((badge, i) => (
                <img
                  key={i}
                  src={badgeIcons[badge.type]}
                  className="badge-icon"
                  alt={badge.type}
                />
              ))
            )}
          </div>
        </div>
      </div>
      { }
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