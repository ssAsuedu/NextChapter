import React from "react";

const About = () => {
  // --- Style Definitions ---
  const containerStyle = {
    padding: "30px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
    paddingLeft: "220px",
    paddingRight: "220px",  // ADD THIS LINE
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
  };

  const headerStyle = {
    marginTop: "80px",
    marginBottom: "40px",
    textAlign: "center",
    paddingBottom: "20px",
    borderBottom: "1px solid #eee",
  };

  const h1Style = {
    fontSize: "3rem",
    marginBottom: "10px",
    color: "#1a1a1a",
    fontWeight: "800",
  };

  const taglineStyle = {
    fontSize: "1.3rem",
    color: "#666",
    lineHeight: "1.6",
    marginTop: "0",
    fontWeight: "300",
  };

  const sectionStyle = {
    marginBottom: "60px",
  };

  const h2Style = {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#2c2c2c",
    display: "inline-block",
    paddingBottom: "5px",
    borderBottom: "4px solid #272B3B", // Accent color for headings
  };

  const missionContentStyle = {
    display: "flex",
    alignItems: "center",
    gap: "60px",
  };

  const textBlockStyle = {
    flex: "2",
  };

  const imageContainerStyle = {
    flex: "1",
    minWidth: "300px",
  };

  const imageStyle = {
    width: "100%",
    height: "auto",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    transform: "rotateY(-2deg)",
    transition: 'transform 0.3s ease',
  };

  const paragraphStyle = {
    fontSize: "1.1rem",
    lineHeight: "1.8",
    color: "#444",
    marginBottom: "16px",
  };

  const featuresGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginTop: "30px",
    width: "100%",  // Ensure full width
  };
  const featureCardStyle = {
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    borderLeft: "5px solid #464854",
    transition: "transform 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",  // Add this
    textAlign: "center",
    gap: "8px",
    minHeight: "200px",  // Add minimum height to ensure vertical centering
  };

  const cardTitleStyle = {
    fontSize: "1.4rem",
    marginBottom: "10px",
    color: "#333",
    fontWeight: "600",
    width: "100%",  // Add this to ensure full width
    textAlign: "center",  // Explicitly center the title
  };

  const cardPStyle = {
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#555",
    margin: "0",
    width: "100%",  // Add this to ensure full width
    textAlign: "center",  // Explicitly center the paragraph text
  };

  const ctaSectionStyle = {
    padding: "60px 30px",
    background: "linear-gradient(135deg, #e8f4f8 0%, #d4e7f0 100%)",
    borderRadius: "10px",
    textAlign: "center",
    marginTop: "40px",
  };

  const ctaButtonBaseStyle = {
    padding: "14px 40px",
    fontSize: "1.2rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  };

  const footerStyle = {
    marginTop: "60px",
    paddingTop: "24px",
    borderTop: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
  };

  const footerTextStyle = {
    fontSize: "0.95rem",
    color: "#888",
    textAlign: "center",
    margin: "0",
  };

  // --- Team Section Styles ---
  const teamGridStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    flexWrap: "wrap",
    marginTop: "60px",
  };

  const teamMemberStyle = {
    width: "180px",
    textAlign: "center",
  };

  const teamAvatarStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%)",
    margin: "0 auto 15px",
    display: "flex",
    justifyContent: "center", // Horizontal centering
    alignItems: "center", // Vertical centering (FIXED)
    fontSize: "3rem",
    transition: "transform 0.3s ease",
    border: "3px solid #ffffff",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
  };

  const teamNameStyle = {
    fontSize: "1.1rem",
    color: "#2c3e50",
    fontWeight: "600",
    marginBottom: "5px",
  };

  const teamRoleStyle = {
    fontSize: "0.9rem",
    color: "#95a5a6",
  };
  
  // --- JSX Structure ---
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={h1Style}>About Next Chapter</h1>
        <p style={taglineStyle}>
          Reigniting the love and passion for reading, one page at a time.
        </p>
      </div>

      {/* Mission Section */}
      <section style={sectionStyle}>
        <div style={missionContentStyle}>
          <div style={textBlockStyle}>
            <h2 style={h2Style}>Our Mission</h2>
            <p style={paragraphStyle}>
              In today's fast-paced world, finding time, motivation, and focus for reading can feel impossible. 
              Next Chapter was created to change that. We believe that reading should be engaging, accessible, 
              and supported by a community of fellow book lovers.
            </p>
            <p style={paragraphStyle}>
              Our platform combines innovative tools with creative features to help you build lasting reading 
              habits, discover your next favorite book, and connect with readers around the world who share 
              your passion.
            </p>
          </div>
          <div style={imageContainerStyle}>
          <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80" 
              alt="Library with beautiful collection of books"
              style={imageStyle}
              onMouseOver={(e) => e.target.style.transform = "rotateY(0deg)"}
              onMouseOut={(e) => e.target.style.transform = "rotateY(-2deg)"}
            />
          </div>
        </div>
      </section>

      {/* What We Offer Section - Features Grid */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What We Offer</h2>
        <div style={featuresGridStyle}>
          
          <div 
            style={featureCardStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h3 style={cardTitleStyle}>📚 Smart Book Management</h3>
            <p style={cardPStyle}>
              Create wish lists, track your reading progress, and celebrate completed books with our 
              intuitive tracking system.
            </p>
          </div>
          
          <div 
            style={featureCardStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h3 style={cardTitleStyle}>💬 Community Connection</h3>
            <p style={cardPStyle}>
              Join themed forums and share your reading journey with fellow book enthusiasts from around the globe.
            </p>
          </div>
          
          <div 
            style={featureCardStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h3 style={cardTitleStyle}>🎨 Creative Expression</h3>
            <p style={cardPStyle}>
              Design mood boards, browse curated collections, and personalize your reading 
              experience with visual inspiration.
            </p>
          </div>
          
          <div 
            style={featureCardStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h3 style={cardTitleStyle}>🔍 Discover New Reads</h3>
            <p style={cardPStyle}>
              Explore millions of books through Google Books API, get personalized recommendations, 
              and find your next literary adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team Section - WITH EMOJI AVATARS */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Our Team</h2>
        <p style={paragraphStyle}>
          Next Chapter was created by a team of five passionate developers and book lovers as a 
          capstone project. United by our shared belief that reading should be accessible and enjoyable 
          for everyone, we combined our technical skills and creativity to build a platform that addresses 
          the challenges modern readers face.
        </p>
        <p style={paragraphStyle}>
          From concept to deployment, we've worked together to design every feature with the reader in 
          mind, ensuring that Next Chapter not only helps you read more but also makes the journey 
          more meaningful and connected.
        </p>
        
        {/* Team Grid with Emojis */}
        <div style={teamGridStyle}>
          {['👩🏾‍💻', '👩🏽‍💻', '👩🏻‍💻', '👩🏿‍💻', '👩🏽‍💻'].map((emoji, index) => (
            <div key={index} style={teamMemberStyle}>
              <div 
                style={teamAvatarStyle}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1) rotate(5deg)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
              >
                {emoji}
              </div>
              <div style={teamNameStyle}>Developer {index + 1}</div>
              <div style={teamRoleStyle}>
                {['Full Stack', 'Frontend', 'UI/UX', 'Backend', 'Database'][index]}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Our Vision Section */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Our Vision</h2>
        <p style={paragraphStyle}>
          We envision a world where reading is celebrated as both a personal journey and a shared 
          experience. Through Next Chapter, we're building more than just an app—we're cultivating 
          a global community of readers who inspire each other, share recommendations, and rediscover 
          the joy of getting lost in a good book.
        </p>
      </section>

      {/* CTA Section */}
      <section style={ctaSectionStyle}>
        <h2 style={{ ...h2Style, borderBottom: "none", marginBottom: "15px", fontSize: "2rem" }}>
          Ready to Start Your Next Chapter?
        </h2>
        <p style={{ fontSize: "1.15rem", color: "#555", marginBottom: "30px" }}>
          Join our community of readers and transform the way you experience books.
        </p>
        <button 
          style={ctaButtonBaseStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <p style={footerTextStyle}>
          Built with React, Node.js, Express, and MongoDB
        </p>
      </footer>
    </div>
  );
};

export default About;