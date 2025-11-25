import React, {useState} from "react";
import {useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/LandingPage/Navbar.css";


const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;
  const location = window.location;
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    localStorage.removeItem("userName"); // Remove the userName from localStorage
 
    navigate("/"); // Redirect to the home page
  };

useEffect(() => {
  const handleResize = () => {
    if(window.innerWidth >= 768) {
      setMenuOpen(false);
    }
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
})

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
    <nav
    style={{
      height: menuOpen ? "350px" : "60px",
      boxShadow: "0 4px 12px rgba(171, 124, 231, 0.3)"
    }}
    >
      <div className="space-between">
      <ul className={menuOpen ? "nav-links open" : "nav-links"}>
        <li><Link to="/">Home</Link></li>
          <li className="about-link">
            <Link to="/about">About</Link>
            <span className="material-symbols-outlined dropdown">
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
        {menuOpen && (
          <>
          <li className="mobile-auth">
            <Link to="/login">Login</Link>
          </li>
          <li className="mobile-auth">
            <Link to="/signup">Sign Up</Link>
          </li>
          </>
        )}
        {/* <li><Link to="/privacyPolicy">Privacy Policy</Link></li> */}
      </ul>
      <div className="toggle-dropdown">
        <button className="burger-drop" onClick={() => setMenuOpen(!menuOpen)}><span className="material-symbols-outlined menu">
          {menuOpen ? "close" : "menu"}
        </span></button>
      </div>
      </div>
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
            <button onClick={handleSignOut} className="auth-signout">Sign Out</button>
          </>
        ) : (
          <>
          <Link to="/signup">
              <button className="auth-signup">Sign Up</button>
          </Link>
          <Link to="/login">
              <button className="auth-login">Login</button>
          </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;