import React from "react";
import "../styles/LandingPage/Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Next Chapter</h1>
          <p>Your journey into the world of books begins here.</p>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>Discover New Books</h2>
        <p>Explore a vast collection of books and find your next favorite read.</p>
        <button onClick={() => navigate("/about")}>Learn More</button>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Track Your Reading</h2>
        <p>Keep track of your reading progress and organize your library.</p>
        <button onClick={() => navigate("/login")}>Explore Features</button>
      </section>

      {/* Community Section */}
      <section className="community">
        <h2>Join the Community</h2>
        <p>Connect with fellow book lovers and share your thoughts.</p>
        <button onClick={() => navigate("/signup")}>Join Now</button>
      </section>
    </div>
  );
};

export default Home;