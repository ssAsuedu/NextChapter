import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/BookInfoPage/BookInfo.css";
import { getBookFromCache, setBookInCache } from "../../utils/apiCache";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { getBookReviews, getBookshelf, addBookToBookshelf, deleteBookFromBookshelf } from "../api";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const BookInfo = () => {
  const { volumeId } = useParams();
  const [book, setBook] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [genresExpanded, setGenresExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [bookshelf, setBookshelf] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      const cached = getBookFromCache(volumeId);
      if (cached) {
        setBook(cached);
        return;
      }
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${GOOGLE_BOOKS_API_KEY}`
        );
        const data = await res.json();
        setBookInCache(volumeId, data);
        setBook(data);
      } catch (err) {
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
  
    const simplifiedGenre = category ? category.split(/[\/-]/)[0].trim() : "Fiction";
  
    const fetchRelated = async () => {
      try {
        let related = [];
  
        if (author) {
          const authorRes = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(author)}&maxResults=20`
          );
          const authorData = await authorRes.json();
  
          const authorBooks = (authorData.items || []).filter(
            b =>
              b.id !== book.id &&
              b.volumeInfo?.authors?.some(a =>
                a.toLowerCase().includes(author.toLowerCase())
              ) &&
              b.volumeInfo?.title?.toLowerCase().trim() !== title &&
              b.volumeInfo?.imageLinks?.thumbnail
          );
  
          related = authorBooks;
        }

        if (related.length < 4 && simplifiedGenre) {
          const genreRes = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(simplifiedGenre)}&maxResults=20`
          );
          const genreData = await genreRes.json();
  
          const genreBooks = (genreData.items || []).filter(
            b =>
              b.id !== book.id &&
              b.volumeInfo?.title?.toLowerCase().trim() !== title &&
              !related.some(r => r.id === b.id) &&
              b.volumeInfo?.imageLinks?.thumbnail 
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
      } catch (err) {
        console.error("Error fetching related books:", err);
      }
    };
  
    fetchRelated();
  }, [book]);
      

  const info = book?.volumeInfo || {};
  const isBookInShelf = bookshelf.includes(volumeId);
  const img = `https://books.google.com/books/content?id=${volumeId}&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs-api`; // fallback

  const handleAddToBookshelf = async () => {
    if (!email) {
      alert("Please log in to add books.");
      return;
    }
    try {
      await addBookToBookshelf({ email, volumeId });
      setBookshelf(prev => [...prev, volumeId]);
      if (book) setBookInCache(volumeId, book);
    } catch {
      alert("Failed to add book.");
    }
  };

  const handleRemoveFromBookshelf = async () => {
    if (!email) {
      alert("Please log in to remove books.");
      return;
    }
    try {
      await deleteBookFromBookshelf({ email, volumeId });
      setBookshelf(prev => prev.filter(id => id !== volumeId));
    } catch {
      alert("Failed to remove book.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const remainder = rating - fullStars;
    const totalStars = 5;
  
    for (let i = 1; i <= totalStars; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && remainder > 0) {
        let className = "star empty";
        if (remainder >= 0.75) className = "star three-quarter";
        else if (remainder >= 0.5) className = "star half";
        else if (remainder >= 0.25) className = "star quarter";
        stars.push(<span key={i} className={className}>★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
  
    return stars;
  };
  

  if (!book) {
    return <div className="bookinfo-loading">Loading...</div>;
  }

  return (
    <div className="bookinfo-container">
      <div className="bookinfo-main-wrapper">
        <div className="bookinfo-main">
          <div className="bookinfo-image-section">
            <img
              src={img}
              alt={info.title}
              className="bookinfo-image"
            />
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
          <div
            className="bookinfo-rating-row"
            onClick={() => {
              const reviewsSection = document.getElementById("reviews");
              if (reviewsSection) {
                const yOffset = -50; 
                const y =
                reviewsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            {averageRating ? (
              <>
                <div className="bookinfo-rating-stars">
                  {renderStars(averageRating)}
                </div>
                <span className="bookinfo-rating-value">
                  {averageRating.toFixed(1)}{" "}
                  <span className="bookinfo-rating-count">
                    ({reviews.length} ratings)
                  </span>
                </span>
              </>
            ) : (
              <span className="bookinfo-no-rating">No ratings yet</span>
            )}
          </div>
          <div className="bookinfo-details-text">
            <p>
              <strong>Author:</strong> {info.authors ? info.authors.join(", ") : "Unknown"}
            </p>
            <p>
              <strong>Genre(s):</strong>{" "}
              {info.categories ? (
                <>
                  {genresExpanded
                    ? info.categories.join(", ") 
                    : info.categories.slice(0, 2).join(", ")
                  }
                  {info.categories.length > 2 && (
                    <button
                      onClick={() => setGenresExpanded(!genresExpanded)}
                      className="genre-toggle"
                    >
                      {genresExpanded ? "Show less" : `+${info.categories.length - 2} more`}
                    </button>
                  )}
                </>
              ) : (
                "Unknown"
              )}
            </p>
            <p>
              <strong>Published:</strong> {info.publishedDate || "Unknown"}
            </p>
          </div>
          <div className={`bookinfo-summary-expandable${expanded ? " expanded" : ""}`}>
            <strong>Summary:</strong>{" "}
            {info.description ? (
              <span
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
              <ArrowDropDownIcon fontSize="large"/>
            </button>
          )}
          {expanded && (
              <button
                className="bookinfo-summary-close"
                onClick={() => setExpanded(false)}
                aria-label="Collapse summary"
              >
                <ArrowDropUpIcon fontSize="large" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div id="reviews" className="bookinfo-reviews-wrapper"></div>
        <h2
          style={{
            color: "#ab7ce7",
            fontSize: "1.6rem",
            fontWeight: "700",
            marginBottom: "4px",
            marginTop: "64px",
          }}
        >
          Reviews
        </h2>
        <p
          style={{
            color: "#7e7e7e",
            fontSize: "1rem",
            margin: "0 0 18px 4px",
          }}
        >
          Real reviews from passionate readers like you
        </p>
        <div className="bookinfo-reviews-section">
          <div className="bookinfo-reviews-list">
            {reviews.length === 0 ? (
              <p>No reviews for this book</p>
            ) : (
              reviews.map((r, idx) => (
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
                    {renderStars(r.rating)}
                  </div>
                  <div className="bookinfo-review-content">{r.reviewText}</div>
                </div>
              ))
            )}
        </div>
      </div>
      <hr className="bookinfo-section-separator" />
      {relatedBooks.length > 0 && (
  <div className="bookinfo-related-section">
    <h2 className="bookinfo-related-header">You May Also Like</h2>
    <p className="bookinfo-related-subtitle">Books related to {info.title}</p>
    <div className="bookinfo-related-list">
      {relatedBooks.map(bk => {
        const b = bk.volumeInfo;
        return (
          <div
  key={bk.id}
  className="bookinfo-related-card"
  onClick={() => {
    navigate(`/book/${bk.id}`);
    window.scrollTo(0, 0);
  }} 
>
  <img
    src={bk.volumeInfo.imageLinks?.thumbnail || "/placeholder-book.png"}
    alt={bk.volumeInfo.title}
  />
  <p className="bookinfo-related-title-text">{bk.volumeInfo.title}</p>
  <p className="bookinfo-related-author">
    {bk.volumeInfo.authors ? bk.volumeInfo.authors.join(", ") : "Unknown"}
  </p>
</div>
        );
      })}
    </div>
  </div>
)}
    </div>
  );
};

export default BookInfo;