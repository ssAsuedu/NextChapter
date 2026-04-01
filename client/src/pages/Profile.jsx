import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import FirstConnection from "../assets/FirstConnection.svg";
import ConversationStarter from "../assets/ConversationStarter.svg";
import { getBadges } from "../api";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Profile = () => {
  const navigate = useNavigate();
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
  const [listDescription, setListDescription] = useState("");
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [lists, setLists] = useState([]);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editSelectedBooks, setEditSelectedBooks] = useState([]);
  const [editListName, setEditListName] = useState("");
  const [editListPrivacy, setEditListPrivacy] = useState("private");
  const [editListDescription, setEditListDescription] = useState("");
  const [editListId, setEditListId] = useState(null);
  const [editListStep, setEditListStep] = useState(1);
  const [openMenuListId, setOpenMenuListId] = useState(null);
  const [activeProfileBadgeIndex, setActiveProfileBadgeIndex] = useState(0);
  const editBookGridRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const [selectedList, setSelectedList] = useState(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [detailSort, setDetailSort] = useState("custom");
  const [draggedBookId, setDraggedBookId] = useState(null);
  const [dragOverBookId, setDragOverBookId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);

  // badge state
  const [badges, setBadges] = useState([]);
  const badgeIcons = {
    HALFWAY: HalfwayBadge,
    FINISHED: JourneyComplete,
    NEW_CHAPTER: NewChapter,
    FUTURE_LIBRARIAN: FutureLibrarian,
    CRITIC_IN_THE_MAKING: CriticInTheMaking,
    FIRST_CONNECTION: FirstConnection,
    CONVERSATION_STARTER: ConversationStarter,
  };

  const startAutoScroll = (direction) => {
    if (scrollIntervalRef.current) return;
    scrollIntervalRef.current = setInterval(() => {
      const container = editBookGridRef.current;
      if (container) {
        container.scrollTop += direction === "up" ? -8 : 8;
      }
    }, 16);
  };
  
  const stopAutoScroll = () => {
    clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = null;
  };
  
  const handleDragOverWithScroll = (e, bookId) => {
    e.preventDefault();
    setDragOverBookId(bookId);
  
    const container = editBookGridRef.current;
    if (!container) return;
  
    const { top, bottom } = container.getBoundingClientRect();
    const threshold = 80;
  
    if (e.clientY < top + threshold) {
      startAutoScroll("up");
    } else if (e.clientY > bottom - threshold) {
      startAutoScroll("down");
    } else {
      stopAutoScroll();
    }
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
            await new Promise(r => setTimeout(r, 200));
          } catch (e) {}
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
        const usersRes = await getAllUsers();
        const foundUser = usersRes.data.find(u => u.email === email);
        if (foundUser) {
          setCreatedAt(foundUser.createdAt);
        }
        const friendsRes = await getFriends(email);
        setFriendCount(Array.isArray(friendsRes.data) ? friendsRes.data.length : 0);
      } catch (e) {
        setCreatedAt(null);
        setFriendCount(0);
      }
    };
    fetchUserInfo();
  }, [email]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuListId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => stopAutoScroll();
  }, []);

  const fetchLists = async () => {
    if (!email) return;
    try {
      const res = await getUserLists(email);
      console.log("fetched lists:", res.data);
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
    setListDescription("");
    setSelectedBooks(new Set());
  };

  const closeCreateListModal = () => {
    setShowCreateListModal(false);
    setCreateListStep(1);
    setListName("");
    setListPrivacy("private");
    setListDescription("");
    setSelectedBooks(new Set());
  };

  const handleNextStep = () => {
    if (listName.trim()) setCreateListStep(2);
  };

  const handleBackStep = () => setCreateListStep(1);

  const toggleBookSelection = (bookId) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) newSelected.delete(bookId);
    else newSelected.add(bookId);
    setSelectedBooks(newSelected);
  };

  const handleCreateList = async () => {
    try {
      await createList({
        email,
        name: listName,
        description: listDescription,
        privacy: listPrivacy,
        books: Array.from(selectedBooks)
      });
      fetchLists();
      closeCreateListModal();
    } catch (err) {
      console.error("Error creating list:", err);
    }
  };

  const handleDeleteList = (listId) => {
    setListToDelete(listId);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteList = async () => {
    try {
      await deleteList(listToDelete);
      fetchLists();
      setShowDeleteModal(false);
      setListToDelete(null);
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
        description: editListDescription,
        privacy: editListPrivacy,
        books: editSelectedBooks,
      });
      await fetchLists();
      if (selectedList && selectedList._id === editListId) {
        setSelectedList(prev => ({
          ...prev,
          name: editListName,
          description: editListDescription,
          privacy: editListPrivacy,
          books: editSelectedBooks,
        }));
      }
      setShowEditListModal(false);
    } catch (err) {
      console.error("Update list error:", err);
    }
  };

  const openEditListModal = (list, e) => {
    e?.stopPropagation();
    setEditingList(list);
    setEditListName(list.name);
    setEditListPrivacy(list.privacy);
    setEditListDescription(list.description || "");
    setEditSelectedBooks(list.books);
    setEditListId(list._id);
    setEditListStep(1);
    setShowEditListModal(true);
  };

  const closeEditListModal = () => {
    setShowEditListModal(false);
    setEditingList(null);
    setEditListStep(1);
  };

  const toggleEditBook = (bookId) => {
    setEditSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleTogglePin = async (list, e) => {
    e.stopPropagation();
    const currentlyPinned = list.pinned === true;
    console.log("listId:", list._id);
    console.log("email:", email);
    console.log("sending pinned:", !currentlyPinned);
    
    try {
      const res = await updateList({
        email,
        listId: list._id,
        name: list.name,
        description: list.description || "",
        privacy: list.privacy,
        books: list.books,
        pinned: !currentlyPinned,
      });
      console.log("response list:", res.data.list);
      console.log("pinned in response:", res.data.list.pinned);
      await fetchLists();
      console.log("lists after fetch:", lists);
    } catch (err) {
      console.error("Pin error:", err.response?.data || err.message);
    }
  };

  const openListDetail = (list) => {
    setSelectedList(list);
    setDetailSearch("");
    setDetailSort("custom");
  };

  const closeListDetail = () => setSelectedList(null);

  const handleDragStart = (bookId) => setDraggedBookId(bookId);

  const handleDragOver = (e, bookId) => {
    e.preventDefault();
    setDragOverBookId(bookId);
  };

  const handleEditDrop = () => {
    if (!draggedBookId || !dragOverBookId || draggedBookId === dragOverBookId) {
      setDraggedBookId(null);
      setDragOverBookId(null);
      return;
    }
    setEditSelectedBooks(prev => {
      const ordered = [...prev];
      const fromIdx = ordered.indexOf(draggedBookId);
      const toIdx = ordered.indexOf(dragOverBookId);
      ordered.splice(fromIdx, 1);
      ordered.splice(toIdx, 0, draggedBookId);
      return ordered;
    });
    setDraggedBookId(null);
    setDragOverBookId(null);
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

  const sortedLists = [...lists].sort((a, b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0));

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : "N/A";
  // group the badges instead of accumulating
  const groupedBadges = Object.entries(
    badges.reduce((acc, badge) => {
      acc[badge.type] = (acc[badge.type] || 0) + 1;
      return acc;
    }, {})
  );

  const changeProfileBadge = (direction) => {
    if (!groupedBadges.length) return;

    setActiveProfileBadgeIndex((prev) => {
      return (prev + direction + groupedBadges.length) % groupedBadges.length;
    });
  };
  
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
          <div className="profile-badges-wrap">
            {groupedBadges.length > 1 && (
              <button
                className="scroll-btn left"
                onClick={() => changeProfileBadge(-1)}
              >
                &#8249;
              </button>
            )}

            <div className="profile-badges-slider">
              {groupedBadges.map(([type, count], index, arr) => {
                const current = activeProfileBadgeIndex;
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
                    <img
                      src={badgeIcons[type]}
                      className="profile-badge-icon"
                    />
                    <span className="profile-badge-count">×{count}</span>
                  </div>
                );
              })}
            </div>

            {groupedBadges.length > 1 && (
              <button
                className="scroll-btn right"
                onClick={() => changeProfileBadge(1)}
              >
                &#8250;
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="profile-content">

        {/* Bookshelf */}
        <div className="profile-bookshelf-container">
          <div className="profile-header-row">
            <h1>Your Bookshelf</h1>
          </div>
          <div className="bookshelf-grid">
            {books.length > 0 ? (
              books.map(book => (
                <div
                  className="bookshelf-item"
                  key={book.id}
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  <BookCard info={book.volumeInfo} volumeId={book.id} />
                </div>
              ))
            ) : (
              <p>No books saved yet.</p>
            )}
          </div>
        </div>

        {/* Lists Section */}
        <div className="profile-lists-container">
          <div className="lists-section">

            <div className="profile-header-row">
              <h1>Your Lists</h1>
            </div>

            <div className="lists-grid">
              {sortedLists.length > 0 ? (
                sortedLists.map(list => (
                  <div
                    key={list._id}
                    className={`list-card ${list.pinned === true ? "list-card-pinned" : ""}`}
                    onClick={() => openListDetail(list)}
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
                    <button
                      className="list-options-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuListId(openMenuListId === list._id ? null : list._id);
                      }}
                    >
                      ⋯
                    </button>

                    {openMenuListId === list._id && (
                      <div className="list-options-menu">
                        <button
                          className="review-option-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuListId(null);
                            handleTogglePin(list, e);
                          }}
                        >
                          {list.pinned === true ? "Unpin List" : "Pin List"}
                        </button>
                        <button
                          className="review-option-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuListId(null);
                            openEditListModal(list, e);
                          }}
                        >
                          Edit List
                        </button>
                        <button
                          className="review-option-item delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuListId(null);
                            handleDeleteList(list._id);
                          }}
                        >
                          Delete List
                        </button>
                      </div>
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
                ))
              ) : (
                <p>No lists created yet.</p>
              )}
            </div>
            <div className="create-list-footer">
              <Button
                variant="contained"
                onClick={openCreateListModal}
                className="create-list-btn"
              >
                Create New List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── List Detail Modal ── */}
      <Modal open={!!selectedList} onClose={closeListDetail} className="review-modal">
        <Box className="review-modal-box large detail-modal-box">
          <div className="detail-modal-header">
            <div className="modal-back" onClick={closeListDetail}>← Back to Lists</div>
            <div>
              <h2 className="review-modal-title">{selectedList?.name}</h2>
              {selectedList?.description && (
                <p className="detail-description">{selectedList.description}</p>
              )}
            </div>
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
              {getDetailBooks().length > 0 ? getDetailBooks().map(book => (
                <div
                  key={book.id}
                  className="detail-book-item"
                  onClick={() => navigate(`/book/${book.id}`)}
                  style={{ cursor: "pointer" }}
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
                </div>
              )) : (
                <p style={{ textAlign: "center", color: "#888", gridColumn: "1 / -1" }}>No books match your search.</p>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* ── Create List Modal ── */}
      <Modal open={showCreateListModal} onClose={closeCreateListModal} className="review-modal">
        <Box
          className={createListStep === 2 ? "review-modal-box large" : "review-modal-box"}
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
                  <label className="modal-label">Description (optional)</label>
                  <textarea
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                    placeholder="What's this list about?"
                    className="modal-input modal-textarea"
                    rows={3}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Privacy</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" value="private" checked={listPrivacy === "private"} onChange={(e) => setListPrivacy(e.target.value)} />
                      <span>Private</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" value="public" checked={listPrivacy === "public"} onChange={(e) => setListPrivacy(e.target.value)} />
                      <span>Public</span>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeCreateListModal}>Cancel</button>
                  <button type="button" className="submit-btn" onClick={handleNextStep} disabled={!listName.trim()}>Next</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="modal-back" onClick={handleBackStep}>← Back</div>
              <h2 className="review-modal-title">Select Books for "{listName}"</h2>
              <div className="book-selection-wrapper">
                <div className="book-selection-grid">
                  {books.map(book => (
                    <div
                      key={book.id}
                      onClick={() => toggleBookSelection(book.id)}
                      className={`book-selection-item ${selectedBooks.has(book.id) ? "selected" : ""}`}
                    >
                      <img
                        src={book.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/128x195?text=No+Cover"}
                        alt={book.volumeInfo?.title}
                        className="book-selection-img"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeCreateListModal}>Cancel</button>
                <button type="button" className="submit-btn" onClick={handleCreateList}>Create List</button>
              </div>
            </>
          )}
        </Box>
      </Modal>

      {/* ── Edit List Modal ── */}
      <Modal open={showEditListModal} onClose={closeEditListModal} className="review-modal">
        <Box
          className={editListStep === 2 ? "review-modal-box large" : "review-modal-box"}
          onClick={(e) => e.stopPropagation()}
        >
          {editListStep === 1 ? (
            <>
              <h2 className="review-modal-title">Edit List</h2>
              <div className="modal-form-container">
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
                  <label className="modal-label">Description (optional)</label>
                  <textarea
                    value={editListDescription}
                    onChange={(e) => setEditListDescription(e.target.value)}
                    placeholder="What's this list about?"
                    className="modal-input modal-textarea"
                    rows={3}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Privacy</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" value="private" checked={editListPrivacy === "private"} onChange={(e) => setEditListPrivacy(e.target.value)} />
                      <span>Private</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" value="public" checked={editListPrivacy === "public"} onChange={(e) => setEditListPrivacy(e.target.value)} />
                      <span>Public</span>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={closeEditListModal}>Cancel</button>
                  <button className="submit-btn" onClick={() => setEditListStep(2)} disabled={!editListName.trim()}>Next</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="modal-back" onClick={() => setEditListStep(1)}>← Back</div>
              <h2 className="review-modal-title">Edit Books for "{editListName}"</h2>
              <div className="book-selection-wrapper" ref={editBookGridRef}>
                <p className="drag-hint">✦ Drag to reorder · Click to add/remove</p>
                <div className="book-selection-grid">
                  {Array.from(editSelectedBooks)
                    .map(id => books.find(b => b.id === id))
                    .filter(Boolean)
                    .map(book => (
                      <div
                        key={book.id}
                        draggable
                        onDragStart={() => handleDragStart(book.id)}
                        onDragOver={(e) => handleDragOverWithScroll(e, book.id)}
                        onDrop={() => { handleEditDrop(); stopAutoScroll(); }}
                        onDragEnd={stopAutoScroll}
                        className={`book-selection-item selected ${dragOverBookId === book.id ? "drag-over" : ""}`}
                      >
                        <div className="drag-handle">⠿</div>
                        <img
                          src={book.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/128x195?text=No+Cover"}
                          alt={book.volumeInfo?.title}
                          className="book-selection-img"
                          onClick={() => toggleEditBook(book.id)}
                        />
                      </div>
                    ))}
                  {books
                    .filter(b => !editSelectedBooks.includes(b.id))
                    .map(book => (
                      <div
                        key={book.id}
                        onClick={() => toggleEditBook(book.id)}
                        className="book-selection-item"
                      >
                        <img
                          src={book.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/128x195?text=No+Cover"}
                          alt={book.volumeInfo?.title}
                          className="book-selection-img"
                        />
                      </div>
                    ))}
                </div>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeEditListModal}>Cancel</button>
                <button className="submit-btn" onClick={handleUpdateList}>Save Changes</button>
              </div>
            </>
          )}
        </Box>        
      </Modal>
      {/* ── Delete Confirm Modal ── */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="delete-modal"
      >
        <Box className="delete-modal-box" onClick={e => e.stopPropagation()}>
          <h2 className="delete-modal-title">Delete List</h2>
          <p className="delete-modal-text">
            Are you sure you want to delete this list? This action cannot be undone.
          </p>
          <div className="delete-modal-actions">
            <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="delete-btn" onClick={confirmDeleteList}>
              Delete
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Profile;