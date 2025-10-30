// src/pages/About.jsx
import React from 'react';
import '../styles/LandingPage/About.css';

<<<<<<< Updated upstream
=======
// Simple SVG Icons as components
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

// Simple Book Illustration
const BookIllustration = () => (
  <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
    {/* Main book cover */}
    <rect x="50" y="50" width="200" height="300" fill="#FFFFFF" stroke="#000000" strokeWidth="4" rx="6" />

    {/* Book spine shadow/depth */}
    <rect x="50" y="50" width="20" height="300" fill="#E0E0E0" stroke="#000000" strokeWidth="2" />

    {/* Book pages edge */}
    <rect x="245" y="55" width="10" height="290" fill="#F5F5F5" stroke="#000000" strokeWidth="2" />

    {/* Decorative lines on cover */}
    <line x1="90" y1="120" x2="210" y2="120" stroke="#000000" strokeWidth="2" />
    <line x1="90" y1="140" x2="210" y2="140" stroke="#000000" strokeWidth="2" />

    {/* Book title area */}
    <rect x="90" y="170" width="120" height="80" fill="none" stroke="#000000" strokeWidth="3" rx="4" />

    {/* Simple book icon in center */}
    <path d="M 130 200 L 130 230 L 150 220 L 170 230 L 170 200 Z" fill="#000000" />

    {/* Bottom decorative lines */}
    <line x1="90" y1="280" x2="210" y2="280" stroke="#000000" strokeWidth="2" />
    <line x1="90" y1="300" x2="210" y2="300" stroke="#000000" strokeWidth="2" />
  </svg>
);

>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
              In today's fast-paced world, finding time, motivation, and focus for reading can feel impossible. 
              Next Chapter was created to change that. We believe that reading should be engaging, accessible, 
              and supported by a community of fellow book lovers.
            </p>
            <p className="paragraph-text">
              Our platform combines innovative tools with creative features to help you build lasting reading 
              habits, discover your next favorite book, and connect with readers around the world who share 
=======
              In today's fast-paced world, finding time, motivation, and focus for reading can feel impossible.
              Next Chapter was created to change that. We believe that reading should be engaging, accessible,
              and supported by a community of fellow book lovers.
            </p>
            <p className="paragraph-text">
              Our platform combines innovative tools with creative features to help you build lasting reading
              habits, discover your next favorite book, and connect with readers around the world who share
>>>>>>> Stashed changes
              your passion.
            </p>
          </div>
          <div className="image-container">
<<<<<<< Updated upstream
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80" 
              alt="Library with beautiful collection of books"
              className="about-image"
              // The hover effects are moved to the CSS file
            />
=======
            <BookIllustration />
>>>>>>> Stashed changes
          </div>
        </div>
      </section>

      {/* What We Offer Section - Features Grid */}
      <section className="section-block">
        <h2 className="h2-heading">What We Offer</h2>
        <div className="features-grid">
<<<<<<< Updated upstream
          
          <div className="feature-card">
            <h3 className="card-title">📚 Smart Book Management</h3>
            <p className="card-paragraph">
              Create wish lists, track your reading progress, and celebrate completed books with our 
              intuitive tracking system.
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="card-title">💬 Community Connection</h3>
=======

          <div className="feature-card">
            <BookIcon />
            <h3 className="card-title">Smart Book Management</h3>
            <p className="card-paragraph">
              Create wish lists, track your reading progress, and celebrate completed books with our
              intuitive tracking system.
            </p>
          </div>

          <div className="feature-card">
            <UsersIcon />
            <h3 className="card-title">Community Connection</h3>
>>>>>>> Stashed changes
            <p className="card-paragraph">
              Join themed forums and share your reading journey with fellow book enthusiasts from around the globe.
            </p>
          </div>
<<<<<<< Updated upstream
          
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
=======

          <div className="feature-card">
            <SparklesIcon />
            <h3 className="card-title">Creative Expression</h3>
            <p className="card-paragraph">
              Design mood boards, browse curated collections, and personalize your reading
              experience with visual inspiration.
            </p>
          </div>

          <div className="feature-card">
            <MagnifyingGlassIcon />
            <h3 className="card-title">Discover New Reads</h3>
            <p className="card-paragraph">
              Explore millions of books through Google Books API, get personalized recommendations,
>>>>>>> Stashed changes
              and find your next literary adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team Section - WITH EMOJI AVATARS */}
      <section className="section-block">
        <h2 className="h2-heading">Our Team</h2>
        <p className="paragraph-text">
<<<<<<< Updated upstream
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
=======
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

        {/* Team Grid with Icons */}
        <div className="team-grid">
          {[
            { name: 'Shifa Sadaat', role: 'Backend' },
            { name: 'Tamara Grujicic', role: 'Frontend' },
            { name: 'Tasnim Haque', role: 'UI/UX' },
            { name: 'Maimouna Gaye', role: 'Backend' },
            { name: 'Diana Torres', role: 'Frontend' }
          ].map((member, index) => (
            <div key={index} className="team-member">
              <div className="team-avatar">
                <UserIcon />
>>>>>>> Stashed changes
              </div>
              <div className="team-name">{member.name}</div>
              <div className="team-role">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="section-block">
        <h2 className="h2-heading">Our Vision</h2>
        <p className="paragraph-text">
<<<<<<< Updated upstream
          We envision a world where reading is celebrated as both a personal journey and a shared 
          experience. Through Next Chapter, we're building more than just an app—we're cultivating 
          a global community of readers who inspire each other, share recommendations, and rediscover 
=======
          We envision a world where reading is celebrated as both a personal journey and a shared
          experience. Through Next Chapter, we're building more than just an app—we're cultivating
          a global community of readers who inspire each other, share recommendations, and rediscover
>>>>>>> Stashed changes
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
            href="/privacyPolicy"
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