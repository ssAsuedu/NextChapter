import React from "react";
import "../styles/LandingPage/Home.css";
import { useNavigate } from "react-router-dom";
import ProfileSVG from "../assets/profile.svg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="left-side-hero">
            <h1>Discover Worlds Between Pages</h1>
            <p>
              Explore thousands of books tailored to your taste. Every story
              is a journey waiting to unfold.
            </p>
            <div className="group-buttons">
              <button className="browse-button" onClick={() => navigate("/explore")}>Browse Books</button>
              <button className="signup-button" onClick={() => navigate("/signup")}>Get Started</button>
            </div>
          </div>
          <div className="right-side-hero">
            <div className="hero-profile-image-container">
              <img
                src={ProfileSVG}
                alt="Profile Illustration"
                className="hero-profile-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>Discover New Books</h2>
        <p>Explore a vast collection of books and find your next favorite read.</p>
        <button onClick={() => navigate("/about")}>Learn More</button>
      </section>

      {/* Trending Books Section */}
      <section className="trending-books">
        <h2>Books Everyone's Talking About</h2>
        <p>Explore trending books that readers can't put down!</p>
      </section>

      {/* Recommended Books Section */}
      <section className="recommended-books">
        <h2>Books We Think You Might Love</h2>
        <p>
          Please <a href="/login">login</a> to see a collection of books we've selected that we think you'll enjoy!
        </p>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Track Your Reading</h2>
        <p>Keep track of your reading progress and organize your library.</p>
        <button onClick={() => navigate("/login")}>Explore Features</button>
      </section>

     
    </div>
  );
};

export default Home;