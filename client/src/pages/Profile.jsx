import React, { useEffect, useState } from "react";
import { getBookshelf, getAllUsers, getFriends } from "../api";
import { createList, getUserLists, deleteList, updateList} from "../api";
import axios from "axios";
import BookCard from "../components/ProfilePage/BookShelfCard";
import "../styles/ProfilePage/Profile.css";
import ProfileLogo from "../assets/profile2.svg";
import { getBookFromCache, setBookInCache } from "../../utils/apiCache";
import Button from "@mui/material/Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
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
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [createListStep, setCreateListStep] = useState(1);
  const [listName, setListName] = useState("");
  const [listPrivacy, setListPrivacy] = useState("private");
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [lists, setLists] = useState([]);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editSelectedBooks, setEditSelectedBooks] = useState(new Set());
  const [editListName, setEditListName] = useState("");
  const [editListPrivacy, setEditListPrivacy] = useState("private");
  const [editListId, setEditListId] = useState(null);

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

  useEffect(() => {
    fetchLists();
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

  const fetchLists = async () => {
    if (!email) return;
  
    try {
      const res = await getUserLists(email);
      setLists(res.data || []);
    } catch (err) {
      console.error("Error fetching lists:", err);
    }
  };

  const openCreateListModal = () => {
    setShowCreateListModal(true);
    setCreateListStep(1);
    setListName("");
    setListPrivacy("private");
    setSelectedBooks(new Set());
  };

  const closeCreateListModal = () => {
    setShowCreateListModal(false);
    setCreateListStep(1);
    setListName("");
    setListPrivacy("private");
    setSelectedBooks(new Set());
  };

  const handleNextStep = () => {
    if (listName.trim()) {
      setCreateListStep(2);
    }
  };

  const handleBackStep = () => {
    setCreateListStep(1);
  };

  const toggleBookSelection = (bookId) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  };

  const handleCreateList = async () => {
    try {
      await createList({
        email,
        name: listName,
        privacy: listPrivacy,
        books: Array.from(selectedBooks)
      });
  
      fetchLists();
      closeCreateListModal();
    } catch (err) {
      console.error("Error creating list:", err);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId);
      fetchLists();
    } catch (err) {
      console.error("Error deleting list:", err);
    }
  };

  const handleUpdateList = async () => {
    try {
      await updateList({
        email,
        listId: editListId,
        name: editListName,
        privacy: editListPrivacy,
        books: Array.from(editSelectedBooks),
      });
  
      await fetchLists();
      setShowEditListModal(false);
    } catch (err) {
      console.error("Update list error:", err);
    }
  };

  const openEditListModal = (list) => {
    setEditingList(list);
    setEditListName(list.name);
    setEditListPrivacy(list.privacy);
    setEditSelectedBooks(new Set(list.books));
    setEditListId(list._id);
    setShowEditListModal(true);
  };
  
  const closeEditListModal = () => {
    setShowEditListModal(false);
    setEditingList(null);
  };
  
  const toggleEditBook = (bookId) => {
    const updated = new Set(editSelectedBooks);
    if (updated.has(bookId)) {
      updated.delete(bookId);
    } else {
      updated.add(bookId);
    }
    setEditSelectedBooks(updated);
  };

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
  
      {/* Main Content */}
      <div className="profile-content">
  
        {/* Bookshelf Header */}
        <div className="profile-header-row">
          <h1>Your Bookshelf</h1>
        </div>
  
        {/* Bookshelf Grid */}
        <div className="bookshelf-grid">
          {books.length > 0 ? (
            books.map(book => (
              <BookCard
                key={book.id}
                info={book.volumeInfo}
                volumeId={book.id}
              />
            ))
          ) : (
            <p>No books saved yet.</p>
          )}
        </div>
  
        {/* Lists Section */}
        <div className="lists-section">
          <div className="profile-header-row">
            <h1>Your Lists</h1>
            <Button
              variant="contained"
              onClick={openCreateListModal}
              className="create-list-btn"
            >
              Create New List
            </Button>
          </div>
          <div className="lists-grid">
            {lists.length > 0 ? (
              lists.map(list => (
                <div key={list._id} className="list-card">
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

                  <h3>{list.name}</h3>
                  <p>{list.books.length} books</p>

                  <div className="list-actions">
                    <button
                      className="edit-list-btn"
                      onClick={() => openEditListModal(list)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-list-btn"
                      onClick={() => handleDeleteList(list._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No lists created yet.</p>
            )}
          </div>
        </div>
      </div>
  
      {/* Create List Modal */}
      <Modal
        open={showCreateListModal}
        onClose={closeCreateListModal}
        className="review-modal"
      >
        <Box
          className={createListStep === 2
            ? "review-modal-box large"
            : "review-modal-box"}
          onClick={(e) => e.stopPropagation()}
        >
  
          {createListStep === 1 ? (
            <>
              <h2 className="review-modal-title">Create New List</h2>
  
              <div className="modal-form-container">
                <div className="modal-field">
                  <label className="modal-label">List Name</label>
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="Enter list name..."
                    className="modal-input"
                  />
                </div>
  
                <div className="modal-field">
                  <label className="modal-label">Privacy</label>
  
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="private"
                        checked={listPrivacy === "private"}
                        onChange={(e) => setListPrivacy(e.target.value)}
                      />
                      <span>Private</span>
                    </label>
  
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="public"
                        checked={listPrivacy === "public"}
                        onChange={(e) => setListPrivacy(e.target.value)}
                      />
                      <span>Public</span>
                    </label>
                  </div>
                </div>
  
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeCreateListModal}
                  >
                    Cancel
                  </button>
  
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleNextStep}
                    disabled={!listName.trim()}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="modal-back" onClick={handleBackStep}>
                ← Back
              </div>
  
              <h2 className="review-modal-title">
                Select Books for "{listName}"
              </h2>
  
              <div className="book-selection-wrapper">
                <div className="book-selection-grid">
                  {books.map(book => (
                    <div
                      key={book.id}
                      onClick={() => toggleBookSelection(book.id)}
                      className={`book-selection-item ${
                        selectedBooks.has(book.id) ? "selected" : ""
                      }`}
                    >
                      <img
                        src={
                          book.volumeInfo?.imageLinks?.thumbnail ||
                          "https://via.placeholder.com/128x195?text=No+Cover"
                        }
                        alt={book.volumeInfo?.title}
                        className="book-selection-img"
                      />
                    </div>
                  ))}
                </div>
              </div>
  
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeCreateListModal}
                >
                  Cancel
                </button>
  
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleCreateList}
                >
                  Create List
                </button>
              </div>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={showEditListModal}
        onClose={closeEditListModal}
        className="review-modal"
      >
        <Box className="review-modal-box large">
          <h2 className="review-modal-title">Edit List</h2>

          <div className="modal-field">
            <label className="modal-label">List Name</label>
            <input
              type="text"
              value={editListName}
              onChange={(e) => setEditListName(e.target.value)}
              className="modal-input"
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Privacy</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="private"
                  checked={editListPrivacy === "private"}
                  onChange={(e) => setEditListPrivacy(e.target.value)}
                />
                <span>Private</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  value="public"
                  checked={editListPrivacy === "public"}
                  onChange={(e) => setEditListPrivacy(e.target.value)}
                />
                <span>Public</span>
              </label>
            </div>
          </div>

          <div className="book-selection-wrapper">
            <div className="book-selection-grid">
              {books.map(book => (
                <div
                  key={book.id}
                  onClick={() => toggleEditBook(book.id)}
                  className={`book-selection-item ${
                    editSelectedBooks.has(book.id) ? "selected" : ""
                  }`}
                >
                  <img
                    src={
                      book.volumeInfo?.imageLinks?.thumbnail ||
                      "https://via.placeholder.com/128x195?text=No+Cover"
                    }
                    alt=""
                    className="book-selection-img"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="cancel-btn" onClick={closeEditListModal}>
              Cancel
            </button>

            <button className="submit-btn" onClick={handleUpdateList}>
              Save Changes
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Profile;
