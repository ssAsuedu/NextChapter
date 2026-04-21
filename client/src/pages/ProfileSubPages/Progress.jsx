import React, { useEffect, useState, useRef } from "react";
import { getBookshelf, getProgress, updateProgress, getGoogleVolume } from "../../api";
import axios from "axios";
import "../../styles/ProfilePage/Progress.css";
import ProfileNavbar from "../../components/ProfilePage/ProfileNavbar";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ReadingStreak from "../../components/ProfilePage/ReadingStreak";
import Confetti from "react-confetti";
import BookCelebration from "../../assets/book_celebration.svg";

//const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Progress = () => {
  const email = localStorage.getItem("userEmail");
  const [bookshelf, setBookshelf] = useState([]);
  const [progress, setProgress] = useState([]);
  const [books, setBooks] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editPage, setEditPage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeConfetti, setFadeConfetti] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const hasMounted = useRef(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [errors, setErrors] = useState({});

  // for react confetti so it can take up the whole width and height of the screen, no matter the size
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // empty deps so listener is only attached once

  const getImage = (imageLinks) => {
    const url =
      imageLinks?.extraLarge ||
      imageLinks?.large ||
      imageLinks?.medium ||
      imageLinks?.thumbnail ||
      imageLinks?.smallThumbnail;

    return url ? url.replace("http://", "https://") : "default-book.png";
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;
      const shelfRes = await getBookshelf(email);
      const progRes = await getProgress(email);
      setBookshelf(shelfRes.data.bookshelf || []);
      setProgress(progRes.data.progress || []);
      setDataLoaded(true);
    };
    fetchData();
  }, [email]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      // if (bookshelf.length === 0) return;
      // const promises = bookshelf.map((id) =>
      //   axios.get(
      //     `https://www.googleapis.com/books/v1/volumes/${id}?key=${GOOGLE_BOOKS_API_KEY}`
      //   )
      // );
      // const results = await Promise.all(promises);
      // setBooks(results.map((r) => r.data));
      if (bookshelf.length === 0) {
        setBooks([]);
        return;
        }
      const results = await Promise.all(
      bookshelf.map(async (id) => {
          try {
            const res = await getGoogleVolume(id);
            return res.data;
            } catch {
              return null;
            }
        }),
    );

      setBooks(results.filter(Boolean));
    };
    fetchBookDetails();
  }, [bookshelf]);

  const getBookProgress = (volumeId, totalPages) => {
    const found = progress.find((p) => p.volumeId === volumeId);
    return found
      ? found
      : { volumeId, currentPage: 0, totalPages: totalPages || 0 };
  };

  const totalRead = progress.filter(
    (p) => p.totalPages > 0 && p.currentPage === p.totalPages
  ).length;

  const [displayTotalRead, setDisplayTotalRead] = useState(totalRead);
  const prevTotalRead = useRef(totalRead);

  useEffect(() => {
    if (!dataLoaded) return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      prevTotalRead.current = totalRead;
      setDisplayTotalRead(totalRead); // first load synced, now confetti won't play upon load
      return;
    }

    if (totalRead > prevTotalRead.current) {
      // if the total books read is greater than currently read books
      setShowConfetti(true); // set confetti to true
      setBookModal(true); // show the congrats book modal
      setTimeout(() => {
        setDisplayTotalRead((prev) => prev + 1);
      }, 4000); // display the updated book count after 4 seconds
    } else if (totalRead < prevTotalRead.current) {
      // if the total is less than the current books
      setDisplayTotalRead(totalRead); // just set the current to the total
    }
    prevTotalRead.current = totalRead;
  }, [totalRead, dataLoaded]);

  useEffect(() => {
    if (showConfetti) {
      // if confetti is triggered (new book read)
      window.scrollTo({
        // scroll to the top of the screen smoothly
        top: 0,
        behavior: "smooth",
      });
    }
  }, [showConfetti]);

  useEffect(() => {
    if (showConfetti) {
      // if the confetti is triggered
      const fadeTimer = setTimeout(() => {
        setFadeConfetti(true); // start fade
      }, 4000); // start fade before it ends

      const removeTimer = setTimeout(() => {
        setShowConfetti(false);
        setFadeConfetti(false);
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showConfetti]);

  const totalInProgress = progress.filter(
    (p) => p.totalPages > 0 && p.currentPage > 0 && p.currentPage < p.totalPages
  ).length;

  const handleEditClick = (idx, currentPage) => {
    setEditIdx(idx);
    setEditPage(currentPage);
  };

  const handleSave = async (volumeId, totalPages) => {
    const currentPage = Number(editPage);
    if (currentPage < 0 || currentPage > totalPages) {
      setErrors((prev) => ({
        ...prev,
        [volumeId]: `Please enter a valid page number.`,
      }));
      return;
    }
    setErrors((prev) => ({
      ...prev,
      [volumeId]: null,
    }));

    await updateProgress({
      email,
      volumeId,
      currentPage,
      totalPages,
    });
    setProgress((prev) => {
      const exists = prev.find((p) => p.volumeId === volumeId);
      if (exists) {
        return prev.map((item) =>
          item.volumeId === volumeId
            ? { ...item, currentPage, totalPages }
            : item
        );
      } else {
        return [...prev, { volumeId, currentPage, totalPages }];
      }
    });
    setEditIdx(null);
  };

  return (
    <div role="main" aria-labelledby="progress-heading">
      <ProfileNavbar />
      {/* Top Section */}
      <div className="progress-top-section">
        {showConfetti && (
          <div className={`confetti ${fadeConfetti ? "fade-out" : ""}`}>
            <Confetti width={windowSize.width} height={windowSize.height} />
          </div>
        )}
        <h1 id="progress-heading" className="progress-title">
          Your Progress
        </h1>
        <div
          className="progress-stats"
          role="region"
          aria-label="Reading statistics"
        >
          <div
            className="books-read-container"
            aria-label={`Total books read: ${displayTotalRead}`}
          >
            <h2 className="total-read">{displayTotalRead}</h2>
            <h3>Books Read</h3>
          </div>
          <div
            className="in-progress-container"
            aria-label={`Total in progress: ${totalInProgress}`}
          >
            <h2 className="currently-reading">{totalInProgress}</h2>
            <h3>In Progress</h3>
          </div>
        </div>
        {!showConfetti && bookModal && (
          <div className="completed-book-overlay">
            <div className="completed-book-content">
              <div className="success-image">
                <img
                  src={BookCelebration}
                  alt="Celebration illustration for completing a book"
                />
              </div>
              <div className="completed-book-text">
                <h3>Congratulations! You finished a book!</h3>
                <h4>Your journey doesn't end here, keep reading!</h4>
              </div>
              <button
                className="keep-reading-btn"
                onClick={() => {
                  setBookModal(false);
                }}
              >
                Keep Reading
              </button>
            </div>
          </div>
        )}
        <div className="progress-streak-wrapper">
          <ReadingStreak />
        </div>
      </div>

      {/* Book cards grid */}
      <div className="progress-page">
        <div
          className="progress-list"
          role="list"
          aria-label="Book progress list"
        >
          {bookshelf.length === 0 ? (
            <p role="status">No books in your bookshelf yet.</p>
          ) : (
            books.map((book, idx) => {
              if (!book) return null;
              const volumeId = book.id;
              const totalPages = book.volumeInfo.pageCount || 0;
              const p = getBookProgress(volumeId, totalPages);
              const percent = totalPages
                ? Math.round((p.currentPage / totalPages) * 100)
                : 0;
              return (
                <div
                  className="progress-book-card"
                  key={volumeId}
                  role="listitem"
                  aria-label={`${book.volumeInfo.title}, ${percent}% complete`}
                >
                  <div className="left-side">
                    <img
                      src={getImage(book.volumeInfo.imageLinks)}
                      alt={`Cover of ${book.volumeInfo.title}`}
                      className="progress-book-image"
                    />
                  </div>
                  <div className="right-side">
                    <div className="progress-book-info">
                      <h3>{book.volumeInfo.title}</h3>
                      <p>{book.volumeInfo.authors?.join(", ")}</p>

                      <div
                        className="progress-bar-container"
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Reading progress: ${percent}%`}
                      >
                        <div
                          className="progress-bar"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="progress-inputs">
                        {editIdx === idx ? (
                          <>
                            <div className="progress-input-wrapper">
                              <label htmlFor={`page-input-${idx}`}>
                                Page:
                              </label>
                              <TextField
                                id={`page-input-${idx}`}
                                type="number"
                                variant="outlined"
                                size="small"
                                value={editPage}
                                onChange={(e) => {
                                  setEditPage(e.target.value);
                                  setErrors((prev) => ({
                                    ...prev,
                                    [volumeId]: null,
                                  }));
                                }}
                                inputProps={{
                                  min: 0,
                                  max: totalPages,
                                  "aria-label": `Current page for ${book.volumeInfo.title}`,
                                  style: {
                                    background: "#faf8ff",
                                    textAlign: "center",
                                  },
                                }}
                                sx={{
                                  minWidth: 0,
                                  marginLeft: 1,
                                  "& .MuiOutlinedInput-root": {
                                    background: "#faf8ff",
                                    "& fieldset": { borderColor: "#e6e0f8" },
                                    "&:hover fieldset": {
                                      borderColor: "#ab7ce7",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#6c3fc5",
                                    },
                                  },
                                }}
                              />
                              <span aria-hidden="true">
                                / {totalPages || "?"}
                              </span>
                            </div>
                            <div className="progress-buttons">
                              <IconButton
                                className="progress-cancel-btn"
                                onClick={() => setEditIdx(null)}
                                size="small"
                                aria-label="Cancel editing"
                                sx={{
                                  height: 36,
                                  width: 36,
                                  background: "#bbb",
                                  color: "#fff",
                                  "&:hover": { background: "#888" },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                className="progress-save-btn"
                                onClick={() => handleSave(volumeId, totalPages)}
                                size="small"
                                aria-label={`Save progress for ${book.volumeInfo.title}`}
                                sx={{
                                  marginLeft: 1,
                                  background: "#ab7ce7",
                                  color: "#fff",
                                  "&:hover": { background: "#6c3fc5" },
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                            </div>
                            {errors[volumeId] && (
                              <span className="error-styling">
                                {errors[volumeId]}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span
                              aria-label={`Page ${p.currentPage} of ${totalPages || "unknown"}`}
                            >
                              Page: {p.currentPage} / {totalPages || "?"}
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        className="progress-edit-btn"
                        onClick={() => {
                          handleEditClick(idx, p.currentPage);
                          setErrors((prev) => ({
                            ...prev,
                            [volumeId]: null,
                          }));
                        }}
                        aria-label={`Update progress for ${book.volumeInfo.title}`}
                      >
                        Update
                      </button>
                      <div className="progress-percent" aria-hidden="true">
                        {percent}% complete
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;