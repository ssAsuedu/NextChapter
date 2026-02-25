import React from "react";
import "../styles/LandingPage/Home.css";
import { useNavigate } from "react-router-dom";
import ProfileSVG from "../assets/profile.svg";
import Community from "../assets/community.svg";
import Team from '@mui/icons-material/Groups';
import Values from '@mui/icons-material/VolunteerActivism';
import Book from '@mui/icons-material/AutoStories';
import DoneAllIcon from '@mui/icons-material/DoneAll';
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-content">
          <div className="left-side-hero">
            <h1 id="hero-heading">Discover Worlds Between Pages</h1>
            <h6><DoneAllIcon aria-hidden="true" /> Explore New Books and Connect with Friends</h6>
            <h6><DoneAllIcon aria-hidden="true" /> Track Your Progress and Earn Badges</h6>
            <h6><DoneAllIcon aria-hidden="true" /> Leave Ratings and View Recommendations</h6>
            <div className="group-buttons">
              <button className="browse-button" onClick={() => navigate("/explore")}  aria-label="Browse books on the Explore page">Browse Books</button>
              <button className="signup-button" onClick={() => navigate("/signup") } aria-label="Sign up for a Next Chapter account">Get Started</button>
            </div>
          </div>
          <div className="right-side-hero">
            <div className="hero-profile-image-container">
              <img
                src={ProfileSVG}
                alt="Illustration of a reader profile"
                className="hero-profile-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Books Section */}
      <section className="trending-books">
        <div className="trending-books-content">
          <div className="trending-books-left">
            <img
              src={Community}
              alt="Illustration of a community of readers"
              className="trending-community-image"
            />
          </div>
          <div className="trending-books-right">
            <h2>Books Everyone's Talking About</h2>
            <p>
              Discover the most popular books in our community. See what other readers are enjoying and join the conversation!
            </p>
            <button className="trending-books-button" onClick={() => navigate("/explore")}  aria-label="Explore trending books on the Explore page">Explore Trending Books</button>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="about">
        <h3 className="values-title">Learn More About Next Chapter's Mission</h3>
        <div className="about-wrapper">
          <button className="about-button" aria-label="Learn more about the Next Chapter platform">
            <Book className="about-icon" />
            Platform
            <h6>Our application empowers users to achieve their reading goals.</h6>
          </button>
          <button className="about-button" aria-label="Learn more about the team behind Next Chapter">
            <Team className="about-icon" />
            Team
            <h6>Developed by a team of passionate readers who want to share their love for books.</h6>
          </button>
          <button className="about-button" aria-label="Learn more about the core values that drive the Next Chapter platform">
            <Values className="about-icon" />
            Values
            <h6>Next Chapter is built on our core values of curiosity, connection, and self-improvement.</h6>
          </button>
        </div>
        
      </section>

      {/* Recommended Books Section */}
      <section className="recommended-books"   aria-labelledby="recommended-heading">
        <h4 id="recommended-heading">Books We Think You Might Love</h4>
        <p>
          Please <a href="/login" aria-label="Log in to your Next Chapter account">login</a> to see a collection of books we've selected that we think you'll enjoy!
        </p>
      </section>


    </div>
  );
};

export default Home;