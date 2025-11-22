import React, { useEffect, useState } from 'react';
import ProfileNavbar from '../../components/ProfilePage/ProfileNavbar';
import "../../styles/ProfilePage/Reviews.css";
import { getReviews, addReview, getBookshelf, deleteReview, editReview } from "../../api";
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
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [ratingError, setRatingError] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

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
      const volumeIds = new Set([
        ...bookshelf,
        ...reviews.map(r => r.volumeId)
      ]);
  
      if (volumeIds.size === 0) return;
  
      const promises = [...volumeIds].map(id =>
        fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
          .then(res => res.json())
          .then(data => ({
            volumeId: id,
            title: data.volumeInfo?.title || "Unknown Title"
          }))
      );
  
      const results = await Promise.all(promises);
      setVolumeOptions(results);
    };
  
    fetchTitles();
  }, [bookshelf, reviews]);

  const getTitleForReview = (volumeId) => {
    const found = volumeOptions.find(v => v.volumeId === volumeId);
    return found ? found.title : volumeId;
  };

  const openModal = () => {
    setIsEditMode(false);
    setEditingReview(null);
    setSelectedVolume(bookshelf[0] || "");
    setRating(0);
    setHoverRating(0);
    setReviewText("");
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingReview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setRatingError("");
    setDuplicateError("");
  
    if (rating === 0) {
      setRatingError("Please choose a rating before submitting.");
      return;
    }
  
    if (!reviewText.trim()) {
      setRatingError("Review text cannot be empty.");
      return;
    }
  
    try {
      if (isEditMode && editingReview) {
        const response = await editReview({ 
          email, 
          volumeId: editingReview.volumeId, 
          rating, 
          reviewText 
        });
      } else {
        const name = localStorage.getItem("userName") || "";
        const response = await addReview({
          email,
          name,
          volumeId: selectedVolume,
          rating,
          reviewText
        });
      }
  
      const reviewsRes = await getReviews(email);
      setReviews(reviewsRes.data.reviews || []);
  
      setShowModal(false);
      setRatingError("");
      setDuplicateError("");
  
    } catch (error) {
      if (error.response?.data?.error === "You have already reviewed this book.") {
        setDuplicateError("You have already reviewed this book.");
      } else {
        setDuplicateError("Failed to submit review.");
      }
    }
  };
  
  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuIndex !== null) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuIndex]);

  const handleEditReview = (review, index) => {
    setIsEditMode(true);
    setEditingReview(review);
    setSelectedVolume(review.volumeId);
    setRating(review.rating);
    setReviewText(review.reviewText);
    setShowModal(true);
    setOpenMenuIndex(null);
  };

  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
    setOpenMenuIndex(null);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
  
    try {
      const response = await deleteReview({
        email,
        volumeId: reviewToDelete.volumeId
      });
  
      console.log("Delete response:", response.data);
  
      const reviewsRes = await getReviews(email);
      setReviews(reviewsRes.data.reviews || []);
  
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review.");
    }
  
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  return (
    <div className="reviews-page">
      <ProfileNavbar />
      <div className="reviews-content">
        <div className="reviews-header">
          <h1>Your Reviews</h1>
          <Button
            variant="contained"
            className="reviews-add-btn"
            onClick={openModal}
          >
            Add Review
          </Button>
        </div>
        <div className="reviews-list">
          {loading ? (
            <p>Loading...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((review, idx) => (
              <div className="review-card" key={review._id || idx}>
                <button 
                  className="review-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(idx);
                  }}
                >
                  ⋮
                </button>
                {openMenuIndex === idx && (
                  <div className="review-options-menu">
                    <button 
                      className="review-option-item"
                      onClick={() => handleEditReview(review, idx)}
                    >
                      Edit Review
                    </button>
                    <button 
                      className="review-option-item delete"
                      onClick={() => handleDeleteReview(review, idx)}
                    >
                      Delete Review
                    </button>
                  </div>
                )}
                <div className="review-title">{getTitleForReview(review.volumeId)}</div>
                <div className="review-rating">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={star <= review.rating ? "star filled" : "star"}>★</span>
                  ))}
                </div>
                <div className="review-text">{review.reviewText}</div>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                  {review.updatedOn && review.updatedOn !== review.createdAt && (
                    <span className="review-updated">
                      &nbsp;· Updated on {new Date(review.updatedOn).toLocaleDateString()}
                    </span>
                  )}
                </div>
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
            <h2 className="review-modal-title">{isEditMode ? 'Edit Review' : 'Add Review'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="book-dropdown">
                <select
                  value={selectedVolume}
                  onChange={e => {
                    setSelectedVolume(e.target.value);
                    setDuplicateError("");
                  }}
                  disabled={isEditMode}
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
                    onClick={() => {
                      setRating(star);
                      setRatingError(""); 
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >★</span>
                ))}
              </div>  
              <br />
              <div className="review-box">
                <textarea
                  value={reviewText}
                  onChange={e => { 
                    setReviewText(e.target.value);
                    setRatingError(""); 
                  }}
                  rows={4}
                  required
                />
              </div>
              {ratingError && <p className="review-error">{ratingError}</p>}
              {duplicateError && <p className="review-error">{duplicateError}</p>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    closeModal();
                    setRatingError("");
                    setDuplicateError("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">{isEditMode ? 'Update' : 'Submit'}</button>
              </div>
            </form>
          </Box>
        </Modal>
        <Modal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          className="delete-modal"
        >
          <Box className="delete-modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="delete-modal-title">Delete Review</h2>
            <p className="delete-modal-text">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={confirmDeleteReview}
              >
                Delete
              </button>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default Review;