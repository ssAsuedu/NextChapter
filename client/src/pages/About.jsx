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
        const yOffset = -50;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, [location]);

  const teamMembers = [
    { name: 'Shifa Sadaat', role: 'Full-stack Developer' },
    { name: 'Tamara Grujicic', role: 'Full-stack Developer' },
    { name: 'Tasnim Haque', role: 'Full-stack Developer' },
    { name: 'Maimouna Gaye', role: 'Full-stack Developer' },
    { name: 'Diana Torres', role: 'Full-stack Developer' }
  ];

  return (
    <div className="about-container" aria-label="About Next Chapter page">
      {/* Hero Section */}
      <section
        className="about-hero"
        aria-label="About Next Chapter hero section"
      >
        <h1 className="about-title">About Next Chapter</h1>
        <p className="about-tagline">
          Reigniting the love and passion for reading, one page at a time.
        </p>
      </section>

      {/* Mission Section - NO BOOK ICON */}
      <section
        id="mission"
        className="about-section mission-section"
        aria-label="Our mission"
      >
        <h2 className="section-heading">Our Mission</h2>
        <div className="mission-text">
          <p>
            In today's fast-paced world, finding time, motivation, and focus for reading can feel impossible.
            Next Chapter was created to change that.
          </p>
          <p>
            We strive to make reading engaging, accessible, and community-driven. Start your next chapter by building
            lasting habits, discovering new books, and connecting with fellow readers.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="what-we-offer"
        className="about-section features-section"
        aria-label="What we offer"
      >
        <h2 className="section-heading">What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card" aria-label="Feature: Smart book management">
            <MenuBookIcon className="feature-icon" aria-hidden="true" />
            <h3>Smart Book Management</h3>
            <p>
              Track your reading, build wishlists, and celebrate finished books.
            </p>
            <div className="card-line"></div>
          </div>

          <div className="feature-card" aria-label="Feature: Community connection">
            <GroupsIcon className="feature-icon" aria-hidden="true" />
            <h3>Community Connection</h3>
            <p>
              Connect with readers and share your journey.
            </p>
            <div className="card-line"></div>
          </div>

          <div className="feature-card" aria-label="Feature: Creative expression">
            <AutoAwesomeIcon className="feature-icon" aria-hidden="true" />
            <h3>Creative Expression</h3>
            <p>
              Show off your badges and make your profile uniquely yours.
            </p>
            <div className="card-line"></div>
          </div>

          <div className="feature-card" aria-label="Feature: Discover new reads">
            <SearchIcon className="feature-icon" aria-hidden="true" />
            <h3>Discover New Reads</h3>
            <p>
              Discover your next literary adventure with personalized suggestions.
            </p>
            <div className="card-line"></div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="about-section team-section"
        aria-label="Our team"
      >
        <h2 className="section-heading">Our Team</h2>
        <p className="team-intro">
          Next Chapter was created by a team of five passionate developers and book lovers as a
          Capstone project. United by our shared belief that reading should be accessible and enjoyable
          for everyone, we combined our technical skills and creativity to build a platform that addresses
          the challenges modern readers face.
        </p>

        <div className="team-grid" aria-label="Team members">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card" aria-label={`Team member ${member.name}, ${member.role}`}>
              <div className="team-avatar">
                <PersonIcon className="avatar-icon" aria-hidden="true" />
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <div className="card-line"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section
        className="about-section vision-section"
        aria-label="Our vision"
      >
        <div className="vision-content">
          <RocketLaunchIcon className="vision-icon" aria-hidden="true" />
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
      <section
        className="about-cta"
        aria-label="Call to action"
      >
        <h2>Ready to Start Your Next Chapter?</h2>
        <p>Join our community of readers and transform the way you experience books.</p>
        <div className="cta-buttons">
          <button
            className="cta-primary"
            onClick={() => navigate('/signup')}
            aria-label="Get started with Next Chapter"
          >
            Get Started
          </button>
          <button
            className="cta-secondary"
            onClick={() => navigate('/explore')}
            aria-label="Browse books on Next Chapter"
          >
            Browse Books
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;