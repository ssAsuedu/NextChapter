import React, { useEffect, useState } from "react";
import { getAvailableMoods, getBooksByMood, getSurpriseMoods } from "../api";
import BookCard from "../components/SearchPage/BookCard";
import "../styles/ExplorePage/MoodFinder.css";

const MoodFinder = () => {
  const [moods, setMoods] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const res = await getAvailableMoods();
        setMoods(res.data.moods || []);
      } catch (err) {
        console.error("Failed to fetch moods:", err);
        setError("Failed to load moods. Make sure the server is running.");
      }
    };
    fetchMoods();
  }, []);

  const toggleMood = (moodId) => {
    setSelectedMoods((prev) => {
      if (prev.includes(moodId)) {
        return prev.filter((m) => m !== moodId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, moodId];
    });
  };

  const handleFindBooks = async () => {
    if (selectedMoods.length === 0) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const res = await getBooksByMood(selectedMoods);
      setBooks(res.data.books || []);
    } catch (err) {
      console.error("Failed to fetch mood books:", err);
      setBooks([]);
      setError("Something went wrong fetching books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSurprise = async () => {
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const surpriseRes = await getSurpriseMoods();
      const surpriseMoods = surpriseRes.data.moods || [];
      const moodIds = surpriseMoods.map((m) => m.id);
      setSelectedMoods(moodIds);

      const res = await getBooksByMood(moodIds);
      setBooks(res.data.books || []);
    } catch (err) {
      console.error("Surprise failed:", err);
      setBooks([]);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedMoods([]);
    setBooks([]);
    setSearched(false);
    setError(null);
  };

  return (
    <div className="mood-page">
      <h1>How are you feeling?</h1>
      <p className="mood-subheading">
        Pick up to 3 moods and we'll find the perfect book for you
      </p>

      {error && <p className="mood-error">{error}</p>}

      {/* Mood cards */}
      <div className="mood-selector" role="group" aria-label="Select your reading mood">
        {moods.map((mood) => {
          const isSelected = selectedMoods.includes(mood.id);
          const isDisabled = !isSelected && selectedMoods.length >= 3;
          return (
            <button
              key={mood.id}
              className={`mood-card ${isSelected ? "mood-card--selected" : ""} ${isDisabled ? "mood-card--disabled" : ""}`}
              onClick={() => toggleMood(mood.id)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={`${mood.label} mood`}
            >
              <span className="mood-card-label">{mood.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="mood-actions">
        <button
          className="mood-find-btn"
          onClick={handleFindBooks}
          disabled={selectedMoods.length === 0 || loading}
        >
          {loading ? "Finding books..." : "Find Books"}
        </button>
        <button
          className="mood-surprise-btn"
          onClick={handleSurprise}
          disabled={loading}
          aria-label="Surprise me with a random mood combination"
        >
          Surprise Me
        </button>
        {selectedMoods.length > 0 && (
          <button className="mood-clear-btn" onClick={clearSelection}>
            Clear
          </button>
        )}
      </div>

      {/* Selected mood tags */}
      {selectedMoods.length > 0 && (
        <div className="mood-selected-tags" aria-label="Selected moods">
          {selectedMoods.map((id) => {
            const mood = moods.find((m) => m.id === id);
            return (
              <span key={id} className="mood-tag">
                {mood?.label}
                <button
                  className="mood-tag-remove"
                  onClick={() => toggleMood(id)}
                  aria-label={`Remove ${mood?.label}`}
                >
                  x
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="mood-loading">
          <div className="mood-loading-spinner" />
          <p>Matching books to your mood...</p>
        </div>
      )}

      {!loading && searched && books.length > 0 && (
        <div className="mood-results">
          <h2 className="mood-results-title">
            Books for your mood ({books.length})
          </h2>
          <div className="mood-books-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                info={book.volumeInfo}
                volumeId={book.id}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && searched && books.length === 0 && !error && (
        <div className="mood-empty">
          <p className="mood-empty-text">
            No books matched that mood combo. Try different moods!
          </p>
          <button className="mood-surprise-btn" onClick={handleSurprise}>
            Try Surprise Me instead
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodFinder;