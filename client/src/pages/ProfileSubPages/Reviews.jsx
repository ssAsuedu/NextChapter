import React, { useEffect, useState } from 'react';
import ProfileNavbar from '../../components/ProfilePage/ProfileNavbar';
import "../../styles/ProfilePage/Reviews.css";
import { getReviews, addReview, getBookshelf } from "../../api";
import Button from "@mui/material/Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const Review = () => {
  const email = localStorage.getItem("userEmail");
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bookshelf, setBookshelf] = useState([]);
  const [selectedVolume, setSelectedVolume] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [volumeOptions, setVolumeOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;
      setLoading(true);
      const [reviewsRes, bookshelfRes] = await Promise.all([
        getReviews(email),
        getBookshelf(email)
      ]);
      setReviews(reviewsRes.data.reviews || []);
      setBookshelf(bookshelfRes.data.bookshelf || []);
      setLoading(false);
    };
    fetchData();
  }, [email]);

  useEffect(() => {
    const fetchTitles = async () => {
      if (bookshelf.length === 0) return;
      const promises = bookshelf.map(id =>
        fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
          .then(res => res.json())
          .then(data => ({
            volumeId: id,
            title: data.volumeInfo?.title || id
          }))
      );
      const results = await Promise.all(promises);
      setVolumeOptions(results);
    };
    fetchTitles();
  }, [bookshelf]);

  const getTitleForReview = (volumeId) => {
    const found = volumeOptions.find(v => v.volumeId === volumeId);
    return found ? found.title : volumeId;
  };

  const openModal = () => {
    setSelectedVolume(bookshelf[0] || "");
    setRating(0);
    setHoverRating(0);
    setReviewText("");
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVolume || rating === 0 || !reviewText.trim()) {
      alert("Please select a book, give a rating, and write a review.");
      return;
    }
    await addReview({ email, volumeId: selectedVolume, rating, reviewText });
    const reviewsRes = await getReviews(email);
    setReviews(reviewsRes.data.reviews || []);
    setShowModal(false);
  };

  return (
    <div className="reviews-page">
      <ProfileNavbar />
      <div className="reviews-content">
        <Button
          variant="contained"
          className="add-review-btn"
          onClick={openModal}
        >
          Add Review
        </Button>
        <h1 className="reviews-title">My Reviews</h1>
        <div className="reviews-list">
          {loading ? (
            <p>Loading...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((review, idx) => (
              <div className="review-card" key={idx}>
                <div className="review-title">{getTitleForReview(review.volumeId)}</div>
                <div className="review-rating">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={star <= review.rating ? "star filled" : "star"}>★</span>
                  ))}
                </div>
                <div className="review-text">{review.reviewText}</div>
                <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
        <Modal
          open={showModal}
          onClose={closeModal}
          aria-labelledby="add-review-modal-title"
          className="review-modal"
        >
          <Box
            className="review-modal-box"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="review-modal-title">Add Review</h2>
            <form onSubmit={handleSubmit}>
              <div className="book-dropdown">
                <select
                  value={selectedVolume}
                  onChange={e => setSelectedVolume(e.target.value)}
                >
                  {volumeOptions.map(opt => (
                    <option key={opt.volumeId} value={opt.volumeId}>{opt.title}</option>
                  ))}
                </select>
              </div>
              <br />
              <div className="star-rating">
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    className={
                      (hoverRating || rating) >= star ? "star filled" : "star"
                    }
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >★</span>
                ))}
              </div>
              <br />
              <div className="review-box">
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn">Submit</button>
              </div>
            </form>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default Review;