import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/LandingPage/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;
  const location = window.location;

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    localStorage.removeItem("userName"); // Remove the userName from localStorage
 
    navigate("/"); // Redirect to the home page
  };

const scrollToSection = (hash) => {
  if (window.location.pathname !== "/about") { //check the current page location
    navigate(`/about${hash}`); //if the user isnt on the about page already, navigate them there with React Router's navigate
  } else {
    const element = document.querySelector(hash); //if user is already on about
    if (element) { //scroll smoothly to that section
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
};

  //Hide the navigation bar on signup and login
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }
  
  // Secure navigation to profile
  const handleProfileClick = () => {
    if (localStorage.getItem("token")) {
      navigate("/profile");
    }
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
          <li className="about-link">
            <Link to="/about">About</Link>
            <span className="material-symbols-outlined">
              keyboard_arrow_down
            </span>
            <ul className="dropdown">
            <li>
              <span onClick={() => scrollToSection("#mission")}>Our Mission</span>
            </li>
            <li>
              <span onClick={() => scrollToSection("#what-we-offer")}>What We Offer</span>
            </li>
            <li>
              <span onClick={() => scrollToSection("#team")}>Our Team</span>
            </li>
          </ul>
          </li>
        
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/explore">Explore</Link></li>
        <li><Link to="/privacyPolicy">Privacy Policy</Link></li>
      </ul>
      <div className="auth-buttons">
        {localStorage.getItem("token") ? (
          <>
            {userInitial && (
              <div
                className="user-initial"
                title={userName}
                onClick={handleProfileClick}
                style={{ cursor: "pointer" }}
                tabIndex={0}
                role="button"
                aria-label="Go to profile"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") handleProfileClick();
                }}
              >
                {userInitial}
              </div>
            )}
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button>Login</button>
            </Link>
            <Link to="/signup">
              <button>Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;