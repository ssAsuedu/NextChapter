import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMessages } from "../../api";
import "../../styles/LandingPage/Navbar.css";
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;
  const location = window.location;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    const fetchUnread = async () => {
      if (!email) return;
  
      try {
        const res = await getMessages(email);
  
        const unread = res.data.messages.filter(
          (msg) => msg.unread === "unread"
        ).length;
  
        setUnreadCount(unread);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchUnread();
  }, [email]);

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
  if (location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/confirm") {
    return null;
  }
  
  // Secure navigation to profile
  const handleProfileClick = () => {
    if (localStorage.getItem("token")) {
      navigate("/profile");
    }
  };

  return (
    <nav className="main-navbar"
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
              <ul className="profile-dropdown">
                <li><span onClick={() => navigate("/progress")}>Progress</span></li>
                <li><span onClick={() => navigate("/reviews")}>Reviews</span></li>
                <li><span onClick={() => navigate("/friends")}>Friends</span></li>
                <li><span onClick={() => navigate("/account")}>Account</span></li>
              </ul>
            </li>
          )}
           {localStorage.getItem("token") && (
            <li>
              <Link to="/leaderboard">Leaderboard</Link>
            </li>
          )}
          {/* Mobile profile section */}
          {localStorage.getItem("token") && menuOpen && isMobile && (
            <>
              <li
                className="mobile-dropdown-header"
                onClick={() => setProfileOpen(prev => !prev)}
              >
                <li><span onClick={() => navigate("/profile")}>Profile</span></li>
                <span className="material-symbols-outlined">
                  {profileOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small"/>}
                </span>
              </li>

              {profileOpen && (
                <>
                  <li className="mobile-dropdown-item"><span onClick={() => go("/progress")}>Progress</span></li>
                  <li className="mobile-dropdown-item"><span onClick={() => go("/reviews")}>Reviews</span></li>
                  <li className="mobile-dropdown-item"><span onClick={() => go("/friends")}>Friends</span></li>
                  <li className="mobile-dropdown-item"><span onClick={() => go("/account")}>Account</span></li>
                </>
              )}
            </>
          )}
        </ul>
        <div className="toggle-dropdown">
          <button className="burger-drop" onClick={() => setMenuOpen(!menuOpen)}><span className="material-symbols-outlined">
            
            {menuOpen ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
          </span></button>
        </div>
      </div>
      {!menuOpen && (
        <div className="nav-message-icon mobile-only" onClick={() => navigate("/messages")}>
          <svg width="30" height="30" viewBox="0 0 22 22" fill="none">
            <path d="M11 2C6.03 2 2 5.69 2 10.2c0 2.6 1.35 4.93 3.47 6.43L4.5 20l3.8-1.9C9.36 18.36 10.17 18.4 11 18.4c4.97 0 9-3.69 9-8.2C20 5.69 15.97 2 11 2Z" fill="#c4a5e8" stroke="#a97dd4" stroke-width="1"/>
          </svg>
          {unreadCount > 0 && <span className="nav-message-badge">{unreadCount}</span>}
        </div>
      )}
      <div className="auth-buttons">
        {localStorage.getItem("token") ? (
          <>
            <div className="nav-message-icon" onClick={() => navigate("/messages")}>
              <svg width="30" height="30" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 2C6.03 2 2 5.69 2 10.2c0 2.6 1.35 4.93 3.47 6.43L4.5 20l3.8-1.9C9.36 18.36 10.17 18.4 11 18.4c4.97 0 9-3.69 9-8.2C20 5.69 15.97 2 11 2Z" fill="#c4a5e8" stroke="#a97dd4" stroke-width="1"/>
              </svg>
              {unreadCount > 0 && <span className="nav-message-badge">{unreadCount}</span>}
            </div>
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