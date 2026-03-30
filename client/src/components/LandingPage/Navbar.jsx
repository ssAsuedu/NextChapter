import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../styles/LandingPage/Navbar.css";
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { IconButton } from '@mui/material';
import { getMessages } from "../../api";

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;
  const location = window.location;
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token") //check to see if user is logged in
  const isAuthenticated = !!token; //true -> user is logged in. false -> user is not logged in

  const [scrolled, setScrolled] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [profileDrop, setProfileDrop] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const mobileRef = useRef(null);
  const aboutRef = useRef(null);
  const profileRef = useRef(null);

  const changeBackground = () => {
    if (window.scrollY >= 80 && window.innerWidth > 768) {
      setScrolled(true);
    }
    else {
      setScrolled(false);
    }
  }

  useEffect(() => {  //runs once on mount and cleanup runs on unmount
    window.addEventListener('scroll', changeBackground); //add scroll listener once

    return () => {
      window.removeEventListener('scroll', changeBackground); //cleanup when component unmounts, prevents memory leaks
    };
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuOpen && mobileRef.current && !mobileRef.current.contains(event.target)) {
        setDropDown(false);
        setProfileDrop(false);
        setMenuOpen(false);
      }
      
      if(!menuOpen) {
        if(aboutRef.current && !aboutRef.current.contains(event.target)) {
          setDropDown(false);
        } 

        if(profileRef.current && !profileRef.current.contains(event.target)) {
          setProfileDrop(false);
        }
      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

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

  const scrollToSection = (hash) => { //hash = id element
    if (window.location.pathname !== "/about") { //check the current page location
      navigate(`/about${hash || ""}`); //if the user isnt on the about page already, navigate them there with React Router's navigate
    } else {
      if (!hash) {
        window.scrollTo({top: 0, behavior: "smooth"});
        return;
      }
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
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className={`navbar-content ${scrolled ? 'scrolled-content' : ''}`}>
        <IconButton className={`menu-btn ${menuOpen ? 'open' : ''}`} aria-label="menu" onClick={() => setMenuOpen(!menuOpen)}>
            <MenuIcon />
          </IconButton>
        {/* <div ref={mobileRef}> */}
        <ul className={`left ${menuOpen ? 'open' : ''}`}>
          <li className=""><Link className={`link ${scrolled ? 'link-scrolled' : 'not-scroll'}`} to="/">Home</Link></li>
          <div ref={aboutRef} className={`about-nav ${scrolled ? 'about-scrolled' : 'not-scroll'}`}>
            
            <div className="about-name-arrow">
              <li className="about-arrow"><Link className={`link ${scrolled ? 'link-scrolled' : 'not-scroll'}`} to="/about">About</Link></li>
              {dropDown ? (
                <KeyboardArrowDownIcon className={`carrot ${scrolled ? 'nav-scrolled' : 'carrot'}`} onClick={() => setDropDown(false)}/>
              ) : (
                <KeyboardArrowUpIcon className={`carrot ${scrolled ? 'nav-scrolled' : 'carrot'}`} onClick={() => setDropDown(!dropDown)}/>
              )}
            </div>
            {dropDown && (
              <div className="dropdown-links">
                <ul>
                  <li className="about-links"><span className="link-text" 
                  onClick={() => {
                    scrollToSection("#mission")
                    setDropDown(false)
                    setMenuOpen(false)
                    setProfileDrop(false)
                  }}>  
                  Our Mission</span></li>
                  <li className="about-links"><span className="link-text" 
                  onClick={() => {
                    scrollToSection("#what-we-offer")
                    setDropDown(false)
                    setMenuOpen(false)
                    setProfileDrop(false)
                  }}>
                  What We Offer</span></li>
                  <li className="about-links"><span className="link-text" 
                  onClick={() => {
                    scrollToSection("#team")
                    setDropDown(false)
                    setMenuOpen(false)
                    setProfileDrop(false)
                  }}>
                  Our Team</span></li>
                </ul>
              </div>
            )}
            </div>
          <li className=""><Link className={`link ${scrolled ? 'link-scrolled' : 'not-scroll'}`} to="/search">Search</Link></li>
          <li className=""><Link className={`link ${scrolled ? 'link-scrolled' : 'not-scroll'}`} to="/explore">Explore</Link></li>
          {isAuthenticated ? (
            <>
            <div ref={profileRef} className="profile-nav">
              <div className="profile-name-arrow">
                <li className="profile-arrow"><Link className={`link ${scrolled ? 'link-scrolled' : 'not-scroll'}`} to="/profile">Profile</Link>
                  {profileDrop ? (
                    <KeyboardArrowDownIcon className={`carrot ${scrolled ? 'nav-scrolled' : 'carrot'}`} onClick={() => setProfileDrop(false)}/>
                  ) : (
                    <KeyboardArrowUpIcon className={`carrot ${scrolled ? 'nav-scrolled' : 'carrot'}`} onClick={() => setProfileDrop(!profileDrop)}/>
                  )}
                </li>
              </div>
              {profileDrop && (
              <div className="dropdown-links">
                <ul>
                  <li className="profile-links"><span className="link-text" 
                  onClick={() => {
                    go("/progress")
                    setDropDown(false)
                    setMenuOpen(false)
                    setProfileDrop(false)
                  }}>
                  Progress</span></li>
                  <li className="profile-links"><span className="link-text" 
                  onClick={() => {
                    go("/reviews")
                    setDropDown(false)
                    setMenuOpen(false)
                    setProfileDrop(false)
                  }}>
                  Reviews</span></li>
                  <li className="profile-links"><span className="link-text" 
                  onClick={() => {
                    go("/friends")
                    setDropDown(false)
                    setMenuOpen(false)
                    setProfileDrop(false)
                  }}>
                  Friends</span></li>
                  <li className="profile-links"><span className="link-text" 
                  onClick={() => {
                    go("/account")
                    setDropDown(false)
                    setMenuOpen(false)
                    setProfileDrop(false)
                  }}>
                  Account</span></li>
                </ul>
              </div>
            )}
            </div>
            
            <li className=""><Link className={`link ${scrolled ? 'link-scrolled' : 'not-scroll'}`} to="/leaderboard">Leaderboard</Link></li>
            </>
          ) : (
            null
          )}
      </ul>
      {/* </div> */}

      <ul className="right">
        {isAuthenticated ? ( //if logged in
          userInitial && (
            <div className={`logged-in ${menuOpen ? 'open' : ''}`}>
              <div className="nav-message-icon" onClick={() => navigate("/messages")}>
                <svg width="30" height="30" viewBox="0 0 22 22" fill="none">
                  <path d="M11 2C6.03 2 2 5.69 2 10.2c0 2.6 1.35 4.93 3.47 6.43L4.5 20l3.8-1.9C9.36 18.36 10.17 18.4 11 18.4c4.97 0 9-3.69 9-8.2C20 5.69 15.97 2 11 2Z"/>
                </svg>
                {unreadCount > 0 && <span className="nav-message-badge">{unreadCount}</span>}
              </div>
              <div
              className={`user-initial ${scrolled ? 'bg-scroll' : 'not-scroll'}`}
              title={userName}
              onClick={handleProfileClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleProfileClick(); 
              }}
              role="button"
              tabIndex={0}
              aria-label="Go to profile"
            >
              {userInitial}
            </div>
            <button onClick={handleSignOut} className={`auth-signout ${scrolled ? 'signout-nav' : 'not-scroll'}`}>Sign Out</button>
            </div>
          )
        ) : ( //not logged in
          <div className={`new-user ${menuOpen ? 'open' : ''}`}>
            <Link to="/signup">
               <button className={`auth-signup ${scrolled ? 'signup-nav' : 'not-scroll'}`}>Sign Up</button>
             </Link>
             <Link to="/login">
               <button className={`auth-login ${scrolled ? 'login-nav' : 'not-scroll'}`}>Login</button>
             </Link>
          </div>
        )}
      </ul>
      </div>
    </nav>
  )
};

export default Navbar;