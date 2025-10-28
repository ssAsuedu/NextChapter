// src/pages/About.jsx
import React from 'react';
import '../styles/LandingPage/About.css';


const About = () => {
  return (
    <div className="about-container">
      <div className="header-section">
        <h1 className="h1-title">About Next Chapter</h1>
        <p className="tagline">
          Reigniting the love and passion for reading, one page at a time.
        </p>
      </div>

      {/* Mission Section */}
      <section className="section-block">
        <div className="mission-content">
          <div className="text-block">
            <h2 className="h2-heading">Our Mission</h2>
            <p className="paragraph-text">
              In today's fast-paced world, finding time, motivation, and focus for reading can feel impossible. 
              Next Chapter was created to change that. We believe that reading should be engaging, accessible, 
              and supported by a community of fellow book lovers.
            </p>
            <p className="paragraph-text">
              Our platform combines innovative tools with creative features to help you build lasting reading 
              habits, discover your next favorite book, and connect with readers around the world who share 
              your passion.
            </p>
          </div>
          <div className="image-container">
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80" 
              alt="Library with beautiful collection of books"
              className="about-image"
              // The hover effects are moved to the CSS file
            />
          </div>
        </div>
      </section>

      {/* What We Offer Section - Features Grid */}
      <section className="section-block">
        <h2 className="h2-heading">What We Offer</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            <h3 className="card-title">📚 Smart Book Management</h3>
            <p className="card-paragraph">
              Create wish lists, track your reading progress, and celebrate completed books with our 
              intuitive tracking system.
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="card-title">💬 Community Connection</h3>
            <p className="card-paragraph">
              Join themed forums and share your reading journey with fellow book enthusiasts from around the globe.
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="card-title">🎨 Creative Expression</h3>
            <p className="card-paragraph">
              Design mood boards, browse curated collections, and personalize your reading 
              experience with visual inspiration.
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="card-title">🔍 Discover New Reads</h3>
            <p className="card-paragraph">
              Explore millions of books through Google Books API, get personalized recommendations, 
              and find your next literary adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team Section - WITH EMOJI AVATARS */}
      <section className="section-block">
        <h2 className="h2-heading">Our Team</h2>
        <p className="paragraph-text">
          Next Chapter was created by a team of five passionate developers and book lovers as a 
          capstone project. United by our shared belief that reading should be accessible and enjoyable 
          for everyone, we combined our technical skills and creativity to build a platform that addresses 
          the challenges modern readers face.
        </p>
        <p className="paragraph-text">
          From concept to deployment, we've worked together to design every feature with the reader in 
          mind, ensuring that Next Chapter not only helps you read more but also makes the journey 
          more meaningful and connected.
        </p>
        
        {/* Team Grid with Emojis */}
        <div className="team-grid">
          {['👩🏾‍💻', '👩🏽‍💻', '👩🏻‍💻', '👩🏿‍💻', '👩🏼‍🦱'].map((emoji, index) => (
            <div key={index} className="team-member">
              <div className="team-avatar">
                {emoji}
              </div>
              <div className="team-name">Developer {index + 1}</div>
              <div className="team-role">
                {['Full Stack', 'Frontend', 'UI/UX', 'Backend', 'Database'][index]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="section-block">
        <h2 className="h2-heading">Our Vision</h2>
        <p className="paragraph-text">
          We envision a world where reading is celebrated as both a personal journey and a shared 
          experience. Through Next Chapter, we're building more than just an app—we're cultivating 
          a global community of readers who inspire each other, share recommendations, and rediscover 
          the joy of getting lost in a good book.
        </p>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-heading">
          Ready to Start Your Next Chapter?
        </h2>
        <p className="cta-paragraph">
          Join our community of readers and transform the way you experience books.
        </p>
        <button className="cta-button">
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="page-footer">
        <p className="footer-text">
          Built with React, Node.js, Express, and MongoDB
        </p>

        {/* 🌟 NEW: Privacy Policy Link 
            Using a standard anchor tag. If you use React Router, 
            replace <a> with <Link to="/privacy-policy">
        */}
        <p className="footer-text">
            <a 
                href="/PrivacyPolicy" 
                className="footer-link"
                title="View our Privacy Policy"
            >
                View our Privacy Policy
            </a>
        </p>

      </footer>
    </div>
  );
};

export default About;