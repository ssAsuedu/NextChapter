import { useState, useEffect } from "react";
import Stars from "../components/Stars";
import { getBookReviews } from "../api";

function BookRating({ volumeId, showRatingValue, showNoRatings, preloadedReviews }) {
  const [averageRating, setAverageRating] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // If parent already fetched reviews for us, use those instead of firing a request
    if (preloadedReviews !== undefined) {
      const fetchedReviews = preloadedReviews || [];
      setReviews(fetchedReviews);
      if (fetchedReviews.length > 0) {
        const avg =
          fetchedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          fetchedReviews.length;
        setAverageRating(avg);
      } else {
        setAverageRating(null);
      }
      return;
    }

    // Fallback: fetch reviews ourselves (used on BookInfo page where only 1 card exists)
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
  }, [volumeId, preloadedReviews]);

  return (
    <div
      className="bookinfo-rating-row"
      onClick={() => {
        const reviewsSection = document.getElementById("reviews");
        if (reviewsSection) {
          const yOffset = -50;
          const y =
            reviewsSection.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }}
    >
      {averageRating ? (
        <>
          <div className="bookinfo-rating-stars">
            <Stars rating={averageRating} />
          </div>
          {showRatingValue && (
            <span className="bookinfo-rating-value">
              {averageRating.toFixed(1)}{" "}
              <span className="bookinfo-rating-count">
                ({reviews.length} ratings)
              </span>
            </span>
          )}
        </>
      ) : (
        showNoRatings && (
          <span className="bookinfo-no-rating-display">No ratings yet</span>
        )
      )}
    </div>
  );
}

export default BookRating;