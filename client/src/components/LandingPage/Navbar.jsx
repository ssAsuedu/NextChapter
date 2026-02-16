import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/LandingPage/Navbar.css";


const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;
  const location = window.location;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [profileOpen, setProfileOpen] = useState(false);

const go = (path) => {
  navigate(path);
  setMenuOpen(false); // close the mobile menu after clicking
};
  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    localStorage.removeItem("userName"); // Remove the userName from localStorage

    navigate("/"); // Redirect to the home page
  };

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth >= 768) {
  //       setMenuOpen(false);
  //     }
  //   };
    
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // })
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };

  // set correct value on first load too
  handleResize();

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
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
        height: menuOpen ? "auto" : "60px",
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
          {/* 👇 ADD THIS BLOCK RIGHT HERE */}
          {menuOpen && isMobile && !localStorage.getItem("token") && (
            <>
              <li className="mobile-auth">
                <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              </li>
              <li className="mobile-auth">
                <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </li>
            </>
          )}

          {menuOpen && isMobile && localStorage.getItem("token") && (
            <li className="mobile-auth">
              <span onClick={() => { handleSignOut(); setMenuOpen(false); }}>
                Sign Out
              </span>
            </li>
          )}
          {/*add a new profile button to the main nav bar to get rid of ambiguity and the vertical nav bar*/}
          {localStorage.getItem("token") && (
            <li className="profile-link">
              
              <Link to="/profile">Profile</Link>

              {/* <span className="material-symbols-outlined profile-caret">
                keyboard_arrow_down
              </span> */}

              <ul className="profile-dropdown">
                <li><span onClick={() => navigate("/profile")}>Bookshelf</span></li>
                <li><span onClick={() => navigate("/progress")}>Progress</span></li>
                <li><span onClick={() => navigate("/reviews")}>Reviews</span></li>
                <li><span onClick={() => navigate("/friends")}>Friends</span></li>
                <li><span onClick={() => navigate("/account")}>Account</span></li>
              </ul>
            </li>
          )}
          {/* Mobile profile section */}
          {localStorage.getItem("token") && menuOpen && isMobile && (
            <>
              <li
                className="mobile-dropdown-header"
                onClick={() => setProfileOpen(prev => !prev)}
              >
                <span>Profile</span>
                <span className="material-symbols-outlined">
                  {profileOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                </span>
              </li>

              {profileOpen && (
                <>
                  <li className="mobile-dropdown-item">
                    <span onClick={() => go("/profile")}>
                      Go to Profile
                    </span>
                  </li>

                  <li className="mobile-dropdown-item"><span onClick={() => go("/profile")}>Bookshelf</span></li>
                  <li className="mobile-dropdown-item"><span onClick={() => go("/progress")}>Progress</span></li>
                  <li className="mobile-dropdown-item"><span onClick={() => go("/reviews")}>Reviews</span></li>
                  <li className="mobile-dropdown-item"><span onClick={() => go("/friends")}>Friends</span></li>
                  <li className="mobile-dropdown-item"><span onClick={() => go("/account")}>Account</span></li>
                </>
              )}
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