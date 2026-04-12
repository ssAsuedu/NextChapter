import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllUsers, getFriends, getUserLists, getBadges, getBookshelf, addBookToBookshelf } from "../api";
import axios from "axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { getBookFromCache, setBookInCache } from "../../utils/apiCache";
import ProfileLogo from "../assets/profile2.svg";
import "../styles/ProfilePage/Profile.css";
import HalfwayBadge from "../assets/HalfwayBadge.svg";
import JourneyComplete from "../assets/JourneyComplete.svg";
import NewChapter from "../assets/NewChapter.svg";
import FutureLibrarian from "../assets/FutureLibrarian.svg";
import CriticInTheMaking from "../assets/CriticInTheMaking.svg";
import FirstConnection from "../assets/FirstConnection.svg";
import ConversationStarter from "../assets/ConversationStarter.svg";
import BookMarathoner from "../assets/BookMarathoner.png";
import BookwormBeginner from "../assets/BookwormBeginner.png";
import DailyReader from "../assets/DailyReader.png";
import DeepDiver from "../assets/DeepDiver.png";
import Explorer from "../assets/Explorer.png";
import GenreJumper from "../assets/GenreJumper.png";
import LibraryLegend from "../assets/LibraryLegend.png";
import Multitasker from "../assets/Multitasker.png";
import Newcomer from "../assets/Newcomer.png";
import ReadingRoutine from "../assets/ReadingRoutine.png";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const FriendProfile = () => {
  const { userEmail } = useParams();
  const email = decodeURIComponent(userEmail);
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("userEmail");
  const [friendInfo, setFriendInfo] = useState(null);
  const [friendCount, setFriendCount] = useState(0);
  const [lists, setLists] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [detailSort, setDetailSort] = useState("custom");
  const [loading, setLoading] = useState(true);
  const [userBookshelf, setUserBookshelf] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activeBadgeIndex, setActiveBadgeIndex] = useState(0);
  const badgeIcons = {
    HALFWAY: HalfwayBadge,
    FINISHED: JourneyComplete,
    NEW_CHAPTER: NewChapter,
    FUTURE_LIBRARIAN: FutureLibrarian,
    CRITIC_IN_THE_MAKING: CriticInTheMaking,
    FIRST_CONNECTION: FirstConnection,
    CONVERSATION_STARTER: ConversationStarter,
    BOOK_MARATHONER: BookMarathoner,
    BOOKWORM_BEGINNER: BookwormBeginner,
    DAILY_READER: DailyReader,
    DEEP_DIVER: DeepDiver,
    EXPLORER: Explorer,
    GENRE_JUMPER: GenreJumper,
    LIBRARY_LEGEND: LibraryLegend,
    MULTITASKER: Multitasker,
    NEWCOMER: Newcomer,
    READING_ROUTINE: ReadingRoutine,
  };
  
  useEffect(() => {
    const fetchUserBookshelf = async () => {
      if (!currentUserEmail) return;
      try {
        const res = await getBookshelf(currentUserEmail);
        setUserBookshelf(res.data.bookshelf || []);
      } catch (e) {}
    };
    fetchUserBookshelf();
  }, [currentUserEmail]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await getBadges(email);
        setBadges(res.data.badges || []);
      } catch (e) {
        setBadges([]);
      }
    };
    fetchBadges();
  }, [email]);

  useEffect(() => {
    if (email === currentUserEmail) {
      navigate("/profile");
    }
  }, [email, currentUserEmail, navigate]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const usersRes = await getAllUsers();
        const found = usersRes.data.find(u => u.email === email);
        setFriendInfo(found || null);

        const friendsRes = await getFriends(email);
        setFriendCount(Array.isArray(friendsRes.data) ? friendsRes.data.length : 0);
      } catch (e) {
        setFriendInfo(null);
      }
    };
    fetchUserInfo();
  }, [email]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await getUserLists(email);
        const publicLists = (res.data || []).filter(l => l.privacy === "public");
        setLists(publicLists);
      } catch (e) {
        setLists([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [email]);

  useEffect(() => {
    const fetchBooks = async () => {
      const allBookIds = [...new Set(lists.flatMap(l => l.books))];
      if (allBookIds.length === 0) return;

      const results = [];
      for (const id of allBookIds) {
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
            await new Promise(r => setTimeout(r, 200));
          } catch (e) {}
        }
      }
      setBooks(results);
    };
    fetchBooks();
  }, [lists]);

  const groupedBadges = Object.entries(
    badges.reduce((acc, badge) => {
      acc[badge.type] = (acc[badge.type] || 0) + 1;
      return acc;
    }, {})
  );

  const changeBadge = (direction) => {
    if (!groupedBadges.length) return;

    setActiveBadgeIndex((prev) =>
      (prev + direction + groupedBadges.length) % groupedBadges.length
    );
  };

  const getDetailBooks = () => {
    if (!selectedList) return [];
    let listBooks = selectedList.books
      .map(id => books.find(b => b.id === id))
      .filter(Boolean);

    if (detailSearch.trim()) {
      const q = detailSearch.toLowerCase();
      listBooks = listBooks.filter(b =>
        b.volumeInfo?.title?.toLowerCase().includes(q) ||
        b.volumeInfo?.authors?.join(", ").toLowerCase().includes(q)
      );
    }

    if (detailSort === "title") {
      listBooks = [...listBooks].sort((a, b) =>
        (a.volumeInfo?.title || "").localeCompare(b.volumeInfo?.title || "")
      );
    } else if (detailSort === "author") {
      listBooks = [...listBooks].sort((a, b) =>
        (a.volumeInfo?.authors?.[0] || "").localeCompare(b.volumeInfo?.authors?.[0] || "")
      );
    }
    return listBooks;
  };

  const handleAddToLibrary = async (bookId) => {
    try {
      await addBookToBookshelf({ email: currentUserEmail, bookId });
      setUserBookshelf(prev => [...prev, bookId]);
    } catch (e) {}
  };

  const formattedDate = friendInfo?.createdAt
    ? new Date(friendInfo.createdAt).toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric"
      })
    : "N/A";

  const sortedLists = [...lists].sort((a, b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0));
  
  if (loading) {
    return <div className="profile-page friend-profile-loading">Loading...</div>;
  }

  if (!friendInfo) {
    return (
      <div className="profile-page friend-profile-loading">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="friend-profile-back" onClick={() => navigate("/friends")}>
          ← Back to Friends
      </div>

      {/* Profile Header */}
      <div className="profile-top-section">
        <div className="profile-logo-container">
          <img src={ProfileLogo} alt="Profile" className="profile-logo" />
        </div>
        <div className="profile-info">
          <h2 className="profile-username">{friendInfo.name}</h2>
          <p className="profile-created">Joined: {formattedDate}</p>
          <p className="profile-followers">Friends: {friendCount}</p>
          {/* apply same formatting/logic across friends and profile page */}
          <div className="profile-badges-row">
            {groupedBadges.length === 0 ? (
              <p>No badges yet</p>
            ) : (
              <div className="profile-badges-wrap">

                {groupedBadges.length > 1 && (
                  <button
                    className="scroll-btn left"
                    onClick={() => changeBadge(-1)}
                  >
                    ‹
                  </button>
                )}

                <div className="profile-badges-slider">
                  {groupedBadges.map(([type, count], index, arr) => {
                    const current = activeBadgeIndex;
                    const prevIndex = (current - 1 + arr.length) % arr.length;
                    const nextIndex = (current + 1) % arr.length;

                    let positionClass = "is-hidden";

                    if (index === current) positionClass = "is-active";
                    else if (index === prevIndex) positionClass = "is-prev";
                    else if (index === nextIndex) positionClass = "is-next";

                    return (
                      <div
                        className={`profile-badge-slide ${positionClass}`}
                        key={type}
                      >
                        {badgeIcons[type] ? (
                          <img
                            src={badgeIcons[type]}
                            className="profile-badge-icon"
                          />
                        ) : (
                          <span>{type}</span>
                        )}
                        <span className="profile-badge-count">×{count}</span>
                      </div>
                    );
                  })}
                </div>

                {groupedBadges.length > 1 && (
                  <button
                    className="scroll-btn right"
                    onClick={() => changeBadge(1)}
                    style={{
                      right: groupedBadges.length > 2 ? "-36px" : "-16px",
                    }}
                  >
                    ›
                  </button>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Public Lists */}
      <div className="profile-content">
        <div className="profile-lists-container">
          <div className="lists-section">
            <div className="profile-header-row">
              <h1>{friendInfo.name}'s Lists</h1>
            </div>

            {lists.length === 0 ? (
              <p className="friend-no-lists">
                This user has no public lists yet.
              </p>
            ) : (
              <div className="lists-grid">
                {sortedLists.map(list => (
                  <div
                    key={list._id}
                    className={`list-card ${list.pinned === true ? "list-card-pinned" : ""}`}
                    onClick={() => {
                      setSelectedList(list);
                      setDetailSearch("");
                      setDetailSort("custom");
                    }}
                  >
                    {list.pinned && (
                      <span className="pin-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#6c3fc5" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 2H8a1 1 0 0 0-1 1v1.5a1 1 0 0 0 .4.8L9 7v4l-2 2h10l-2-2V7l1.6-1.7a1 1 0 0 0 .4-.8V3a1 1 0 0 0-1-1z" />
                          <line x1="12" y1="13" x2="12" y2="21" stroke="#6c3fc5" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Pinned
                      </span>
                    )}
                    <div className="list-card-body">
                      <div className="list-thumbnail">
                        {list.books.slice(0, 3).map((bookId, index) => {
                          const book = books.find(b => b.id === bookId);
                          return book ? (
                            <img
                              key={bookId}
                              src={book.volumeInfo?.imageLinks?.thumbnail}
                              alt=""
                              className="list-thumb-img"
                              style={{ zIndex: 3 - index }}
                            />
                          ) : null;
                        })}
                      </div>
                      <div className="list-card-info">
                        <h3 className="list-card-title">{list.name}</h3>
                        {list.description && (
                          <p className="list-card-description">{list.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List Detail Modal */}
      <Modal
        open={!!selectedList}
        onClose={() => setSelectedList(null)}
        className="review-modal"
      >
        <Box className="review-modal-box large detail-modal-box">
          <div className="detail-modal-header">
            <div className="modal-back" onClick={() => setSelectedList(null)}>
              ← Back to Lists
            </div>
            <h2 className="review-modal-title">{selectedList?.name}</h2>
            {selectedList?.description && (
              <p className="detail-description">{selectedList.description}</p>
            )}
          </div>

          <div className="detail-controls">
            <input
              className="modal-input detail-search"
              placeholder="Search by title or author..."
              value={detailSearch}
              onChange={e => setDetailSearch(e.target.value)}
            />
            <select
              className="detail-sort-select"
              value={detailSort}
              onChange={e => setDetailSort(e.target.value)}
            >
              <option value="custom">Default</option>
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
            </select>
          </div>

          <div className="book-selection-wrapper">
            <div className="detail-books-grid">
              {getDetailBooks().length > 0 ? (
                getDetailBooks().map(book => (
                  <div
                    key={book.id}
                    className="detail-book-item"
                    onClick={() => navigate(`/book/${book.id}`)}
                  >
                    <img
                      src={book.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/128x195?text=No+Cover"}
                      alt={book.volumeInfo?.title}
                      className="detail-book-img"
                    />
                    <div className="detail-book-info">
                      <p className="detail-book-title">{book.volumeInfo?.title}</p>
                      <p className="detail-book-author">{book.volumeInfo?.authors?.join(", ")}</p>
                    </div>
                    <button
                      className={`add-to-library-btn ${userBookshelf.includes(book.id) ? "saved" : ""}`}
                      disabled={userBookshelf.includes(book.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToLibrary(book.id);
                      }}
                    >
                      {userBookshelf.includes(book.id) ? "Saved" : "Add to Library"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="detail-empty">No books match your search.</p>
              )}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default FriendProfile;