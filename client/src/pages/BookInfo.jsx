import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/BookInfoPage/BookInfo.css";
import { getBookFromCache, setBookInCache } from "../../utils/apiCache";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
getBookReviews,
getBookshelf,
addBookToBookshelf,
deleteBookFromBookshelf,
sendMessage,
getFriends,
getGoogleVolume,
searchGoogleVolumes,
} from "../api";
import BookJournal from "../components/ExplorePage/BookJournal";
import ReplyIcon from "@mui/icons-material/Reply";
import Stars from "../components/Stars";
import BookRating from "../components/BookRating";
import { Link } from "react-router-dom";

//const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;
const GENRE_LIMIT = 3;

const formatGenre = (genre) => {
  if (!genre) return "";

  const parts = genre.split("/").map((p) => p.trim());

  if (parts.length >= 2) {
    return parts[1];
  }
  return parts[0];
};

const BookInfo = () => {
  const { volumeId } = useParams();
  const [book, setBook] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [genresExpanded, setGenresExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [bookshelf, setBookshelf] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loginModal, setLoginModal] = useState(false);

  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const resetShareModal = () => {
    setSelectedFriends([]);
    setShowShare(false);
  };
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("login-modal-wrapper")) {
      setLoginModal(false);
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      const cached = getBookFromCache(volumeId);
      if (cached) {
        setBook(cached);
        return;
      }
      try {
        // const res = await fetch(
        //   `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${GOOGLE_BOOKS_API_KEY}`,
        // );
        // const data = await res.json();
        const res = await getGoogleVolume(volumeId);
        const data = res.data;
        setBookInCache(volumeId, data);
        setBook(data);
      } catch {
        setBook(null);
      }
    };
    fetchBook();
  }, [volumeId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getBookReviews(volumeId);
        const fetchedReviews = res.data.reviews || [];
        setReviews(fetchedReviews);
        if (fetchedReviews.length > 0) {
          const avg =
            fetchedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            fetchedReviews.length;
          setAverageRating(avg);
        } else {
          setAverageRating(null);
        }
      } catch {
        setReviews([]);
        setAverageRating(null);
      }
    };
    fetchReviews();
  }, [volumeId]);

  useEffect(() => {
    const fetchShelf = async () => {
      if (!email) return;
      try {
        const res = await getBookshelf(email);
        setBookshelf(res.data.bookshelf || []);
      } catch {
        setBookshelf([]);
      }
    };
    fetchShelf();
  }, [email]);

  useEffect(() => {
    if (!book) return;
    const category = book.volumeInfo?.categories?.[0];
    const author = book.volumeInfo?.authors?.[0];
    const title = book.volumeInfo?.title?.toLowerCase().trim();
    if (!category && !author) return;
    const simplifiedGenre = category
      ? category.split(/[\/-]/)[0].trim()
      : "Fiction";

    const fetchRelated = async () => {
      try {
        let related = [];
        if (author) {
          // const authorRes = await fetch(
          //   `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(author)}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`,
          // );
          // const authorData = await authorRes.json();
          const authorRes = await searchGoogleVolumes(`inauthor:${author}`, 20);
          const authorData = authorRes.data;
          const authorBooks = (authorData.items || []).filter(
            (b) =>
              b.id !== book.id &&
              b.volumeInfo?.authors?.some((a) =>
                a.toLowerCase().includes(author.toLowerCase()),
              ) &&
              b.volumeInfo?.title?.toLowerCase().trim() !== title &&
              b.volumeInfo?.imageLinks?.thumbnail,
          );
          related = authorBooks;
        }

        if (related.length < 4 && simplifiedGenre) {
          // const genreRes = await fetch(
          //   `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(simplifiedGenre)}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`,
          // );
          // const genreData = await genreRes.json();
          const genreRes = await searchGoogleVolumes(
          `subject:${simplifiedGenre}`,20,);
          const genreData = genreRes.data;
          const genreBooks = (genreData.items || []).filter(
            (b) =>
              b.id !== book.id &&
              b.volumeInfo?.title?.toLowerCase().trim() !== title &&
              !related.some((r) => r.id === b.id) &&
              b.volumeInfo?.imageLinks?.thumbnail,
          );
          related = [...related, ...genreBooks];
        }

        const uniqueTitles = new Set();
        const uniqueRelated = [];
        for (const b of related) {
          const t = b.volumeInfo?.title?.toLowerCase().trim();
          if (!uniqueTitles.has(t)) {
            uniqueTitles.add(t);
            uniqueRelated.push(b);
          }
        }
        setRelatedBooks(uniqueRelated.slice(0, 4));
      } catch (err) {}
    };
    fetchRelated();
  }, [book]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!email) return;
      try {
        const res = await getFriends(email);
        setFriends(res.data || []);
      } catch {
        setFriends([]);
      }
    };
    fetchFriends();
  }, [email]);

  const getSortedReviews = () => {
    const sorted = [...reviews];
    if (sortBy === "highest") {
      return sorted.sort((a, b) => b.rating - a.rating);
    } else {
      return sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }
  };

  const info = book?.volumeInfo || {};
  const isBookInShelf = bookshelf.includes(volumeId);
  const img = `https://books.google.com/books/content?id=${volumeId}&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs-api`;

  const handleAddToBookshelf = async () => {
    if (!email) {
      setLoginModal(true);
      return;
    }
    try {
      await addBookToBookshelf({ email, volumeId });
      setBookshelf((prev) => [...prev, volumeId]);
      if (book) setBookInCache(volumeId, book);
    } catch {
      alert("Failed to add book.");
    }
  };

  const handleRemoveFromBookshelf = async () => {
    if (!email) {
      setLoginModal(true);
      resetShareModal();
      return;
    }
    try {
      await deleteBookFromBookshelf({ email, volumeId });
      setBookshelf((prev) => prev.filter((id) => id !== volumeId));
    } catch {
      alert("Failed to remove book.");
    }
  };

  const handleShare = async () => {
    if (!email) {
      alert("Please log in to share books.");
      return;
    }
    if (selectedFriends.length === 0) {
      alert("Please select at least one friend.");
      return;
    }
    try {
      await Promise.all(
        selectedFriends.map((friend) =>
          sendMessage({
            senderEmail: email,
            receiverEmail: friend.email,
            volumeId: book.id,
            title: book.volumeInfo.title,
            coverUrl:
              book.volumeInfo.imageLinks?.thumbnail?.replace(
                "http://",
                "https://",
              ) || null,
            author: book.volumeInfo.authors?.[0] || null,
            type: "book_recommendation",
          }),
        ),
      );
      setShowSuccess(true);
      resetShareModal();
    } catch (err) {
      alert("Failed to send recommendation.");
    }
  };

  const handleLogin = () => {
    setLoginModal(true);
  };

  if (!book) {
    return <div className="bookinfo-loading">Loading...</div>;
  }

  return (
    <div className="bookinfo-container">
      <div className="bookinfo-main-wrapper">
        <div className="bookinfo-main">
          <div className="bookinfo-image-section">
            <img src={img} alt={info.title} className="bookinfo-image" />
          </div>
          <div className="bookinfo-details-section">
            <div className="bookinfo-title-row">
              <h1 className="bookinfo-title">{info.title}</h1>
              {isBookInShelf ? (
                <button
                  className="bookinfo-add-btn bookinfo-in-shelf"
                  onClick={handleRemoveFromBookshelf}
                >
                  Remove from Bookshelf
                </button>
              ) : (
                <button
                  className="bookinfo-add-btn"
                  onClick={handleAddToBookshelf}
                >
                  Add to Bookshelf
                </button>
              )}
            </div>

            <div className="bookinfo-rating-share-row">
              <BookRating
                volumeId={volumeId}
                showRatingValue={true}
                showNoRatings={true}
              />
              <button
                className="bookinfo-share-btn"
                onClick={() => {
                  if (!email) {
                    setLoginModal(true);
                    return;
                  }
                  setSelectedFriends([]);
                  setShowShare(true);
                }}
              >
                Share <ReplyIcon className="share-icon" />
              </button>
            </div>

            <div className="bookinfo-details-text">
              <div className="author-text-section">
                <strong id="author-heading">Author(s):</strong>{" "}
                <p className="authors-display">
                  {info.authors ? info.authors.join(", ") : "Unknown"}
                </p>
              </div>
              <div className="genre-text-section">
                <strong id="genre-heading">Genre(s):</strong>{" "}
                <div className="genres-display">
                  {info.categories ? (
                    <div className="genre-wrapper">
                      {(genresExpanded
                        ? info.categories
                        : info.categories.slice(0, GENRE_LIMIT)
                      )
                        .map(formatGenre)
                        .join(", ")}

                      {info.categories.length > GENRE_LIMIT && (
                        <div className="genres-toggle-wrapper">
                          <button
                            onClick={() => setGenresExpanded(!genresExpanded)}
                            className={`genre-toggle ${genresExpanded ? "show-more" : "show-less"}`}
                          >
                            {genresExpanded
                              ? "Show less"
                              : `+${info.categories.length - GENRE_LIMIT} more`}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    "Unknown"
                  )}
                </div>
              </div>
              <div className="published-section">
                <strong id="published-heading">Published:</strong>
                <p className="published-display">
                  {info.publishedDate ? info.publishedDate : "Unknown"}
                </p>
              </div>
            </div>

            <div
              className={`bookinfo-summary-expandable${expanded ? " expanded" : ""}`}
            >
              <strong id="summary-heading">Summary:</strong>{" "}
              {info.description ? (
                <span
                  className="book-description-text"
                  dangerouslySetInnerHTML={{ __html: info.description }}
                />
              ) : (
                "No summary available."
              )}
            </div>
            {!expanded && info.description && (
              <button
                className="bookinfo-summary-toggle"
                onClick={() => setExpanded(true)}
                aria-label="Expand summary"
              >
                Read More
                <ArrowDropDownIcon className="arrow-icon" fontSize="large" />
              </button>
            )}
            {expanded && (
              <button
                className="bookinfo-summary-close"
                onClick={() => setExpanded(false)}
                aria-label="Collapse summary"
              >
                <ArrowDropUpIcon className="arrow-icon" fontSize="large" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div id="reviews" className="bookinfo-reviews-wrapper">
        <h2 className="bookinfo-reviews-header">Reviews</h2>
        <p className="bookinfo-reviews-subtitle">
          Real reviews from passionate readers like you
        </p>
        <div className="bookinfo-sort-container">
          <label htmlFor="sort-reviews">Sort by: </label>
          <select
            id="sort-reviews"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bookinfo-sort-select"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
          </select>
        </div>
        <div className="bookinfo-reviews-section">
          <div className="bookinfo-reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews-available">No reviews for this book</p>
            ) : (
              getSortedReviews().map((r, idx) => (
                <div key={idx} className="bookinfo-review">
                  <div className="bookinfo-review-content">
                    <strong>{r.name || r.email}</strong> -{" "}
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </div>
                  <div className="bookinfo-review-content">
                    <Stars rating={r.rating} />
                  </div>
                  <div className="bookinfo-review-content">{r.reviewText}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BookJournal volumeId={volumeId} />
      <hr className="bookinfo-section-separator" />

      {relatedBooks.length > 0 && (
        <div className="bookinfo-related-section">
          <h2 className="bookinfo-related-header">You May Also Like</h2>
          <p className="bookinfo-related-subtitle">
            Books related to {info.title}
          </p>
          <div className="bookinfo-related-list">
            {relatedBooks.map((bk) => (
              <div
                key={bk.id}
                className="bookinfo-related-card"
                onClick={() => {
                  navigate(`/book/${bk.id}`);
                  window.scrollTo(0, 0);
                }}
              >
                <img
                  src={
                    bk.volumeInfo.imageLinks?.thumbnail ||
                    "/placeholder-book.png"
                  }
                  alt={bk.volumeInfo.title}
                />
                <p className="bookinfo-related-title-text">
                  {bk.volumeInfo.title}
                </p>
                <p className="bookinfo-related-author">
                  {bk.volumeInfo.authors
                    ? bk.volumeInfo.authors.join(", ")
                    : "Unknown"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showShare && (
        <div className="share-modal-overlay" onClick={resetShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="share-heading">Share this book</h3>

            {friends.length === 0 && (
              <h4 className="add-friends-text">
                Add{" "}
                <a href="/friends" className="link-to-friends">
                  friends
                </a>{" "}
                to get started!
              </h4>
            )}

            {selectedFriends.length > 0 && (
              <div className="share-selected">
                {selectedFriends.map((friend, idx) => (
                  <div
                    key={idx}
                    tabIndex={0}
                    className="share-selected-chip"
                    onClick={() =>
                      setSelectedFriends((prev) =>
                        prev.filter((f) => f.email !== friend.email),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedFriends((prev) =>
                          prev.filter((f) => f.email !== friend.email),
                        );
                      }
                    }}
                  >
                    {friend.name || friend.email} ✕
                  </div>
                ))}
              </div>
            )}
            <div className="share-friends-container">
              {friends
                .filter(
                  (f) => !selectedFriends.some((s) => s.email === f.email),
                )
                .map((friend, idx) => (
                  <div
                    key={idx}
                    className="share-friend-chip"
                    tabIndex={0}
                    role="button"
                    onClick={() =>
                      setSelectedFriends((prev) => [...prev, friend])
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedFriends((prev) => [...prev, friend]);
                      }
                    }}
                  >
                    {friend.name || friend.email}
                  </div>
                ))}
            </div>
            <div className="share-actions">
              <button
                className="share-confirm-btn"
                onClick={handleShare}
                disabled={selectedFriends.length === 0}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    {
                      handleShare;
                    }
                  }
                }}
              >
                Confirm
              </button>
              <button className="bookinfo-cancel" onClick={resetShareModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div
          className="share-modal-overlay"
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="share-modal success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="success-icon">✓</div>
            <h3 id="recommendation-sent">Recommendation Sent!</h3>
            <p className="recommendation-confirmation">
              Your friend(s) will receive your book recommendation.
            </p>
            <button
              className="share-confirm-btn"
              onClick={() => setShowSuccess(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
      {loginModal && (
        <div className="login-modal-wrapper" onClick={handleOutsideClick}>
          <div className="login-modal-content">
            <div className="login-modal-title">
              <h1>Login Required</h1>
              <p>Please login to continue.</p>
            </div>
            <div className="button-display">
              <Link to="/login" className="login-btn-display">
                Login
              </Link>
              <button
                className="close-btn-display"
                onClick={() => setLoginModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookInfo;
