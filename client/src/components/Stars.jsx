function Stars({ rating }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const remainder = rating - fullStars;
  const totalStars = 5;

  for (let i = 1; i <= totalStars; i++) {
    if (i <= fullStars) {
      stars.push(
        <span key={i} className="star full">
          ★
        </span>,
      );
    } else if (i === fullStars + 1 && remainder > 0) {
      let className = "star empty";
      if (remainder >= 0.75) className = "star three-quarter";
      else if (remainder >= 0.5) className = "star half";
      else if (remainder >= 0.25) className = "star quarter";
      stars.push(
        <span key={i} className={className}>
          ★
        </span>,
      );
    } else {
      stars.push(
        <span key={i} className="star empty">
          ★
        </span>,
      );
    }
  }
  return <div className="bookinfo-rating-stars">{stars}</div>;
}

export default Stars;
