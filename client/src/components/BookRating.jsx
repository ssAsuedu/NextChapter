import { useState, useEffect } from "react";
import Stars from "../components/Stars";
import { getBookReviews } from "../api";

function BookRating({ volumeId, showRatingValue, showNoRatings }) {
  const [averageRating, setAverageRating] = useState(null);
  const [reviews, setReviews] = useState([]);

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
