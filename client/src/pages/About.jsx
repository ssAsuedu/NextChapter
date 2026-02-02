import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import '../styles/LandingPage/About.css';

// MUI Icons (matching your Home page)
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FavoriteIcon from '@mui/icons-material/Favorite';

const About = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const teamMembers = [
    { name: 'Shifa Sadaat', role: 'Backend' },
    { name: 'Tamara Grujicic', role: 'Frontend' },
    { name: 'Tasnim Haque', role: 'UI/UX' },
    { name: 'Maimouna Gaye', role: 'Backend' },
    { name: 'Diana Torres', role: 'Frontend' }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <h1 className="about-title">About Next Chapter</h1>
        <p className="about-tagline">
          Reigniting the love and passion for reading, one page at a time.
        </p>
      </section>

      {/* Mission Section - NO BOOK ICON */}
      <section id="mission" className="about-section mission-section">
        <h2 className="section-heading">Our Mission</h2>
        <div className="mission-text">
          <p>
            In today's fast-paced world, finding time, motivation, and focus for reading can feel impossible.
            Next Chapter was created to change that. We believe that reading should be engaging, accessible,
            and supported by a community of fellow book lovers.
          </p>
          <p>
            Our platform combines innovative tools with creative features to help you build lasting reading
            habits, discover your next favorite book, and connect with readers around the world who share
            your passion.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="what-we-offer" className="about-section features-section">
        <h2 className="section-heading">What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <MenuBookIcon className="feature-icon" />
            <h3>Smart Book Management</h3>
            <p>
              Create wish lists, track your reading progress, and celebrate completed books with our
              intuitive tracking system.
            </p>
          </div>

          <div className="feature-card">
            <GroupsIcon className="feature-icon" />
            <h3>Community Connection</h3>
            <p>
              Join themed forums and share your reading journey with fellow book enthusiasts from around the globe.
            </p>
          </div>

          <div className="feature-card">
            <AutoAwesomeIcon className="feature-icon" />
            <h3>Creative Expression</h3>
            <p>
              Design mood boards, browse curated collections, and personalize your reading
              experience with visual inspiration.
            </p>
          </div>

          <div className="feature-card">
            <SearchIcon className="feature-icon" />
            <h3>Discover New Reads</h3>
            <p>
              Explore millions of books through Google Books API, get personalized recommendations,
              and find your next literary adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="about-section team-section">
        <h2 className="section-heading">Our Team</h2>
        <p className="team-intro">
          Next Chapter was created by a team of five passionate developers and book lovers as a
          capstone project. United by our shared belief that reading should be accessible and enjoyable
          for everyone, we combined our technical skills and creativity to build a platform that addresses
          the challenges modern readers face.
        </p>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">
                <PersonIcon className="avatar-icon" />
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section className="about-section vision-section">
        <div className="vision-content">
          <RocketLaunchIcon className="vision-icon" />
          <h2 className="section-heading">Our Vision</h2>
          <p>
            We envision a world where reading is celebrated as both a personal journey and a shared
            experience. Through Next Chapter, we're building more than just an app—we're cultivating
            a global community of readers who inspire each other, share recommendations, and rediscover
            the joy of getting lost in a good book.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Ready to Start Your Next Chapter?</h2>
        <p>Join our community of readers and transform the way you experience books.</p>
        <div className="cta-buttons">
          <button className="cta-primary" onClick={() => navigate('/signup')}>
            Get Started
          </button>
          <button className="cta-secondary" onClick={() => navigate('/explore')}>
            Browse Books
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <p>Built with <FavoriteIcon className="heart-icon" /> using React, Node.js, Express, and MongoDB</p>
        <a href="/privacyPolicy" className="footer-link">View our Privacy Policy</a>
      </footer>
    </div>
  );
};

export default About;