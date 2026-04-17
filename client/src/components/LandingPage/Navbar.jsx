import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../styles/LandingPage/Navbar.css";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Logo from "/MainColorLogo.svg";
import whiteLogo from "/NextChapterLogoWhite.svg";
import darkModeNotScrolledLogo from "/LighterColorLogo.svg";
import useLocalStorage from "use-local-storage";
import { IconButton } from "@mui/material";
import { getMessages } from "../../api";

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;
  const location = window.location;
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token"); //check to see if user is logged in
  const isAuthenticated = !!token; //true -> user is logged in. false -> user is not logged in

  const [scrolled, setScrolled] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [profileDrop, setProfileDrop] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isDark] = useLocalStorage("isDark", false);

  const isActive = scrolled || menuOpen; //active is if navbar is scrolled or if the burger menu is open
  const currentLogo = isActive //if the navbar is scrolled or the menu is ever open
    ? whiteLogo //always display the white logo
    : isDark //if we're on dark mode and we haven't scrolled on the navbar
      ? darkModeNotScrolledLogo //always display the dark mode logo (light color)
      : Logo; //otherwise, display the regular dark purple logo

  const changeBackground = () => {
    if (window.scrollY >= 80 && window.innerWidth > 768) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    //runs once on mount and cleanup runs on unmount
    window.addEventListener("scroll", changeBackground); //add scroll listener once

    return () => {
      window.removeEventListener("scroll", changeBackground); //cleanup when component unmounts, prevents memory leaks
    };
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!email) return;
      try {
        const res = await getMessages(email);
        const unread = new Set(
          res.data.messages
            .filter((msg) => msg.unread === "unread" && msg.receiver === email)
            .map((msg) => msg.sender),
        ).size;
        setUnreadCount(unread);
      } catch (err) {}
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 30000);

    const handleMessagesRead = (e) => {
      setUnreadCount(e.detail.newCount);
    };
    window.addEventListener("messagesRead", handleMessagesRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener("messagesRead", handleMessagesRead);
    };
  }, [email]);

  const go = (path) => {
    navigate(path);
    setMenuOpen(false); // close the mobile menu after clicking
  };
  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    navigate("/");
  };

  const scrollToSection = (hash) => {
    //hash = id element
    if (window.location.pathname !== "/about") {
      //check the current page location
      navigate(`/about${hash || ""}`); //if the user isnt on the about page already, navigate them there with React Router's navigate
      return;
    }

    if (!hash) {
      //if the user is already on the about page
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    //scroll to the specific dropdown sections in the navbar
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  //Hide the navigation bar on signup and login
  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/confirm"
  ) {
    return null;
  }

  // Secure navigation to profile
  const handleProfileClick = () => {
    if (localStorage.getItem("token")) {
      navigate("/profile");
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className={`navbar-content ${scrolled ? "scrolled-content" : ""}`}>
        <IconButton
          className={`menu-btn ${menuOpen ? "open" : ""}`}
          aria-label="menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MenuIcon />
        </IconButton>
        <ul className={`left ${menuOpen ? "open" : ""}`}>
          <li>
            <img className="logo" src={currentLogo}></img>
          </li>
          <li className="">
            <Link
              className={`link ${scrolled ? "link-scrolled" : "not-scroll"}`}
              to="/"
            >
              Home
            </Link>
          </li>
          <div
            className={`about-nav ${scrolled ? "about-scrolled" : "not-scroll"}`}
          >
            <div className="about-name-arrow">
              <li className="about-arrow">
                <Link
                  id="about-dropdown"
                  className={`link ${scrolled ? "link-scrolled" : "not-scroll"}`}
                  onClick={() => scrollToSection()}
                  to="/about"
                >
                  About
                </Link>
                <div className="dropdown-links desktop-dropdown">
                  <ul>
                    <li className="about-links">
                      <span
                        className="link-text"
                        onClick={() => {
                          scrollToSection("#mission");
                          setDropDown(false);
                          setMenuOpen(false);
                          setProfileDrop(false);
                        }}
                      >
                        Our Mission
                      </span>
                    </li>
                    <li className="about-links">
                      <span
                        className="link-text"
                        onClick={() => {
                          scrollToSection("#what-we-offer");
                          setDropDown(false);
                          setMenuOpen(false);
                          setProfileDrop(false);
                        }}
                      >
                        What We Offer
                      </span>
                    </li>
                    <li className="about-links">
                      <span
                        className="link-text"
                        onClick={() => {
                          scrollToSection("#team");
                          setDropDown(false);
                          setMenuOpen(false);
                          setProfileDrop(false);
                        }}
                      >
                        Our Team
                      </span>
                    </li>
                  </ul>
                </div>
              </li>
              {dropDown ? (
                <KeyboardArrowUpIcon
                  className={`carrot ${scrolled ? "nav-scrolled" : "carrot"}`}
                  onClick={() => setDropDown(false)}
                />
              ) : (
                <KeyboardArrowDownIcon
                  className={`carrot ${scrolled ? "nav-scrolled" : "carrot"}`}
                  onClick={() => setDropDown(!dropDown)}
                />
              )}
            </div>
            {dropDown && (
              <div className="dropdown-links mobile-dropdown">
                <ul>
                  <li className="about-links">
                    <span
                      className="link-text"
                      onClick={() => {
                        scrollToSection("#mission");
                        setDropDown(false);
                        setMenuOpen(false);
                        setProfileDrop(false);
                      }}
                    >
                      Our Mission
                    </span>
                  </li>
                  <li className="about-links">
                    <span
                      className="link-text"
                      onClick={() => {
                        scrollToSection("#what-we-offer");
                        setDropDown(false);
                        setMenuOpen(false);
                        setProfileDrop(false);
                      }}
                    >
                      What We Offer
                    </span>
                  </li>
                  <li className="about-links">
                    <span
                      className="link-text"
                      onClick={() => {
                        scrollToSection("#team");
                        setDropDown(false);
                        setMenuOpen(false);
                        setProfileDrop(false);
                      }}
                    >
                      Our Team
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <li className="">
            <Link
              className={`link ${scrolled ? "link-scrolled" : "not-scroll"}`}
              to="/search"
            >
              Search
            </Link>
          </li>
          <li className="">
            <Link
              className={`link ${scrolled ? "link-scrolled" : "not-scroll"}`}
              to="/explore"
            >
              Explore
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <div className="profile-nav">
                <div className="profile-name-arrow">
                  <li className="profile-arrow">
                    <Link
                      className={`link ${scrolled ? "link-scrolled" : "not-scroll"}`}
                      to="/profile"
                    >
                      Profile
                    </Link>
                    <div className="dropdown-links desktop-dropdown">
                      <ul>
                        <li className="profile-links">
                          <span
                            className="link-text"
                            onClick={() => {
                              go("/progress");
                              setDropDown(false);
                              setMenuOpen(false);
                              setProfileDrop(false);
                            }}
                          >
                            Progress
                          </span>
                        </li>
                        <li className="profile-links">
                          <span
                            className="link-text"
                            onClick={() => {
                              go("/reviews");
                              setDropDown(false);
                              setMenuOpen(false);
                              setProfileDrop(false);
                            }}
                          >
                            Reviews
                          </span>
                        </li>
                        <li className="profile-links">
                          <span
                            className="link-text"
                            onClick={() => {
                              go("/friends");
                              setDropDown(false);
                              setMenuOpen(false);
                              setProfileDrop(false);
                            }}
                          >
                            Friends
                          </span>
                        </li>
                        <li className="profile-links">
                          <span
                            className="link-text"
                            onClick={() => {
                              go("/account");
                              setDropDown(false);
                              setMenuOpen(false);
                              setProfileDrop(false);
                            }}
                          >
                            Account
                          </span>
                        </li>
                      </ul>
                    </div>
                  </li>
                  {profileDrop ? (
                    <KeyboardArrowUpIcon
                      className={`carrot ${scrolled ? "nav-scrolled" : "carrot"}`}
                      onClick={() => setProfileDrop(false)}
                    />
                  ) : (
                    <KeyboardArrowDownIcon
                      className={`carrot ${scrolled ? "nav-scrolled" : "carrot"}`}
                      onClick={() => setProfileDrop(!profileDrop)}
                    />
                  )}
                </div>
                {profileDrop && (
                  <div className="dropdown-links mobile-dropdown">
                    <ul>
                      <li className="profile-links">
                        <span
                          className="link-text"
                          onClick={() => {
                            go("/progress");
                            setDropDown(false);
                            setMenuOpen(false);
                            setProfileDrop(false);
                          }}
                        >
                          Progress
                        </span>
                      </li>
                      <li className="profile-links">
                        <span
                          className="link-text"
                          onClick={() => {
                            go("/reviews");
                            setDropDown(false);
                            setMenuOpen(false);
                            setProfileDrop(false);
                          }}
                        >
                          Reviews
                        </span>
                      </li>
                      <li className="profile-links">
                        <span
                          className="link-text"
                          onClick={() => {
                            go("/friends");
                            setDropDown(false);
                            setMenuOpen(false);
                            setProfileDrop(false);
                          }}
                        >
                          Friends
                        </span>
                      </li>
                      <li className="profile-links">
                        <span
                          className="link-text"
                          onClick={() => {
                            go("/account");
                            setDropDown(false);
                            setMenuOpen(false);
                            setProfileDrop(false);
                          }}
                        >
                          Account
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <li className="">
                <Link
                  className={`link ${scrolled ? "link-scrolled" : "not-scroll"}`}
                  to="/leaderboard"
                >
                  Leaderboard
                </Link>
              </li>
            </>
          ) : null}
        </ul>
        <ul className="right">
          {isAuthenticated ? ( //if logged in
            userInitial && (
              <div className={`logged-in ${menuOpen ? "open" : ""}`}>
                <div
                  className="nav-message-icon"
                  onClick={() => navigate("/messages")}
                >
                  <div className="message-wrapper">
                    <svg width="33" height="33" viewBox="0 0 22 22" fill="none">
                      <path d="M11 2C6.03 2 2 5.69 2 10.2c0 2.6 1.35 4.93 3.47 6.43L4.5 20l3.8-1.9C9.36 18.36 10.17 18.4 11 18.4c4.97 0 9-3.69 9-8.2C20 5.69 15.97 2 11 2Z" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="nav-message-badge">{unreadCount}</span>
                    )}
                  </div>
                  <span className="message-mobile-text">Messages</span>
                </div>
                <div
                  className={`user-initial ${scrolled ? "bg-scroll" : "not-scroll"}`}
                  title={userName}
                  onClick={handleProfileClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleProfileClick();
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Go to profile"
                >
                  {userInitial}
                </div>
                <button
                  onClick={handleSignOut}
                  className={`auth-signout desktop-dropdown ${scrolled ? "signout-nav" : "not-scroll"}`}
                >
                  Sign Out
                </button>
              </div>
            )
          ) : (
            //not logged in
            <div className={`new-user ${menuOpen ? "open" : ""}`}>
              <Link to="/signup">
                <button
                  className={`auth-signup ${scrolled ? "signup-nav" : "not-scroll"}`}
                >
                  Sign Up
                </button>
              </Link>
              <Link to="/login">
                <button
                  className={`auth-login ${scrolled ? "login-nav" : "not-scroll"}`}
                >
                  Login
                </button>
              </Link>
            </div>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
