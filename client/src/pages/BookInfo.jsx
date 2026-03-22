import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/BookInfoPage/BookInfo.css";
import { getBookFromCache, setBookInCache } from "../../utils/apiCache";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { getBookReviews, getBookshelf, addBookToBookshelf, deleteBookFromBookshelf, sendMessage, getFriends } from "../api";
import BookJournal from "../components/ExplorePage/BookJournal";
import ReplyIcon from "@mui/icons-material/Reply";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const BookInfo = () => {
  const { volumeId } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

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

  const resetShareModal = () => {
    setSelectedFriends([]);
    setShowShare(false);
  };

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
          const authorRes = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(
              author
            )}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`
          );
          const authorData = await authorRes.json();

          related = (authorData.items || []).filter(
            (b) =>
              b.id !== book.id &&
              b.volumeInfo?.authors?.some((a) =>
                a.toLowerCase().includes(author.toLowerCase())
              ) &&
              b.volumeInfo?.title?.toLowerCase().trim() !== title &&
              b.volumeInfo?.imageLinks?.thumbnail
          );
        }

        if (related.length < 4 && simplifiedGenre) {
          const genreRes = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(
              simplifiedGenre
            )}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`
          );
          const genreData = await genreRes.json();

          const genreBooks = (genreData.items || []).filter(
            (b) =>
              b.id !== book.id &&
              b.volumeInfo?.title?.toLowerCase().trim() !== title &&
              !related.some((r) => r.id === b.id) &&
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
    }

    return sorted.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const info = book?.volumeInfo || {};
  const isBookInShelf = bookshelf.includes(volumeId);
  const img = `https://books.google.com/books/content?id=${volumeId}&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs-api`;

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
            </div>

            <div className="bookinfo-rating-share-row">
              <div className="bookinfo-rating-row">
                {averageRating ? (
                  <>
                    <div className="bookinfo-rating-stars">
                      {/* stars */}
                    </div>
                    <span className="bookinfo-rating-value">
                      {averageRating.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <span>No ratings yet</span>
                )}
              </div>

              <button className="bookinfo-share-btn">
                Share <ReplyIcon className="share-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookInfo;