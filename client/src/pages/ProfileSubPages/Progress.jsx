import React, { useEffect, useState } from "react";
import { getBookshelf, getProgress, updateProgress } from "../../api";
import axios from "axios";
import "../../styles/ProfilePage/Progress.css";


const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API;

const Progress = () => {
  const email = localStorage.getItem("userEmail");
  const [bookshelf, setBookshelf] = useState([]);
  const [progress, setProgress] = useState([]);
  const [books, setBooks] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editPage, setEditPage] = useState(0);

  // Fetch bookshelf and progress
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

  // Fetch book details for all bookshelf items
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

  // Helper: get progress for a volumeId, or default
  const getBookProgress = (volumeId, totalPages) => {
    const found = progress.find(p => p.volumeId === volumeId);
    return found
      ? found
      : { volumeId, currentPage: 0, totalPages: totalPages || 0 };
  };

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
        return prev.map((item, i) =>
          item.volumeId === volumeId ? { ...item, currentPage, totalPages } : item
        );
      } else {
        return [...prev, { volumeId, currentPage, totalPages }];
      }
    });
    setEditIdx(null);
  };

  return (
    <div className="progress-page">
      <h1>Your Book Progress</h1>
      <div className="progress-list">
        {bookshelf.length === 0 ? (
          <p>No books in your bookshelf yet.</p>
        ) : (
          books.map((book, idx) => {
            if (!book) return null;
            const volumeId = book.id;
            const totalPages =
              book.volumeInfo.pageCount || 0;
            const p = getBookProgress(volumeId, totalPages);
            const percent = totalPages
              ? Math.round((p.currentPage / totalPages) * 100)
              : 0;
            return (
              <div className="progress-book-card" key={volumeId}>
                <img
                  src={book.volumeInfo.imageLinks?.thumbnail || "/default-book.png"}
                  alt={book.volumeInfo.title}
                  className="progress-book-image"
                />
                <div className="progress-book-info">
                  <h3>{book.volumeInfo.title}</h3>
                  <p>{book.volumeInfo.authors?.join(", ")}</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="progress-inputs">
                    {editIdx === idx ? (
                      <>
                        <label>
                          Page:
                          <input
                            type="number"
                            min={0}
                            max={totalPages}
                            value={editPage}
                            onChange={e => setEditPage(e.target.value)}
                            style={{ width: 60, marginLeft: 8 }}
                          />
                          / {totalPages || "?"}
                        </label>
                        <button
                          className="progress-save-btn"
                          onClick={() => handleSave(idx, volumeId, totalPages)}
                          style={{ marginLeft: 12 }}
                        >
                          Save
                        </button>
                        <button
                          className="progress-cancel-btn"
                          onClick={() => setEditIdx(null)}
                          style={{ marginLeft: 8 }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span>
                          Page: {p.currentPage} / {totalPages || "?"}
                        </span>
                        <button
                          className="progress-edit-btn"
                          onClick={() => handleEditClick(idx, p.currentPage)}
                          style={{ marginLeft: 12 }}
                        >
                          Update Progress
                        </button>
                      </>
                    )}
                  </div>
                  <div className="progress-percent">{percent}% complete</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Progress;