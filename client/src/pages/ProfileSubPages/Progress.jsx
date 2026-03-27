import React, { useEffect, useState } from "react";
import { getBookshelf, getProgress, updateProgress } from "../../api";
import axios from "axios";
import "../../styles/ProfilePage/Progress.css";
import ProfileNavbar from "../../components/ProfilePage/ProfileNavbar";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ReadingStreak from "../../components/ProfilePage/ReadingStreak";

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Progress = () => {
  const email = localStorage.getItem("userEmail");
  const [bookshelf, setBookshelf] = useState([]);
  const [progress, setProgress] = useState([]);
  const [books, setBooks] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editPage, setEditPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;
      const shelfRes = await getBookshelf(email);
      const progRes = await getProgress(email);
      setBookshelf(shelfRes.data.bookshelf || []);
      setProgress(progRes.data.progress || []);
    };
    fetchData();
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

  const getBookProgress = (volumeId, totalPages) => {
    const found = progress.find(p => p.volumeId === volumeId);
    return found
      ? found
      : { volumeId, currentPage: 0, totalPages: totalPages || 0 };
  };

  const totalRead = progress.filter(p => p.totalPages > 0 && p.currentPage === p.totalPages).length;
  const totalInProgress = progress.filter(p => p.totalPages > 0 && p.currentPage > 0 && p.currentPage < p.totalPages).length;

  const handleEditClick = (idx, currentPage) => {
    setEditIdx(idx);
    setEditPage(currentPage);
  };

  const handleSave = async (idx, volumeId, totalPages) => {
    const currentPage = Math.max(0, Math.min(Number(editPage), totalPages));
    await updateProgress({
      email,
      volumeId,
      currentPage,
      totalPages,
    });
    setProgress(prev => {
      const exists = prev.find(p => p.volumeId === volumeId);
      if (exists) {
        return prev.map((item) =>
          item.volumeId === volumeId ? { ...item, currentPage, totalPages } : item
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
        <h1 id="progress-heading" className="progress-title">Your Progress</h1>

        <div className="progress-streak-wrapper">
          <ReadingStreak />
        </div>

        <div
          className="progress-stats"
          role="region"
          aria-label="Reading statistics"
        >
          <div className="progress-stat-line" aria-label={`Total books read: ${totalRead}`}>
            Total Books Read: {totalRead}
          </div>
          <div className="progress-stat-line" aria-label={`Total in progress: ${totalInProgress}`}>
            Total In Progress: {totalInProgress}
          </div>
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
                      src={book.volumeInfo.imageLinks?.thumbnail || "/default-book.png"}
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
                      <div className="progress-bar" style={{ width: `${percent}%` }} />
                    </div>

                    <div className="progress-inputs">
                      {editIdx === idx ? (
                        <>
                          <label htmlFor={`page-input-${idx}`}>
                            Page:
                          </label>
                          <TextField
                            id={`page-input-${idx}`}
                            type="number"
                            variant="outlined"
                            size="small"
                            value={editPage}
                            onChange={e => setEditPage(e.target.value)}
                            inputProps={{
                              min: 0,
                              max: totalPages,
                              "aria-label": `Current page for ${book.volumeInfo.title}`,
                              style: { background: "#faf8ff" }
                            }}
                            sx={{
                              width: 70,
                              marginLeft: 1,
                              "& .MuiOutlinedInput-root": {
                                background: "#faf8ff",
                                "& fieldset": { borderColor: "#e6e0f8" },
                                "&:hover fieldset": { borderColor: "#ab7ce7" },
                                "&.Mui-focused fieldset": { borderColor: "#6c3fc5" },
                              }
                            }}
                          />
                          <span aria-hidden="true">/ {totalPages || "?"}</span>
                          <IconButton
                            className="progress-cancel-btn"
                            onClick={() => setEditIdx(null)}
                            size="small"
                            aria-label="Cancel editing"
                            sx={{
                              marginLeft: 1,
                              background: "#bbb",
                              color: "#fff",
                              "&:hover": { background: "#888" }
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                          <IconButton
                            className="progress-save-btn"
                            onClick={() => handleSave(idx, volumeId, totalPages)}
                            size="small"
                            aria-label={`Save progress for ${book.volumeInfo.title}`}
                            sx={{
                              marginLeft: 1,
                              background: "#ab7ce7",
                              color: "#fff",
                              "&:hover": { background: "#6c3fc5" }
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <span aria-label={`Page ${p.currentPage} of ${totalPages || "unknown"}`}>
                            Page: {p.currentPage} / {totalPages || "?"}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                        className="progress-edit-btn"
                        onClick={() => handleEditClick(idx, p.currentPage)}
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