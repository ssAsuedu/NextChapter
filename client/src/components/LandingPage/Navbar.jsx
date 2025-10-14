import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/LandingPage/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    localStorage.removeItem("userName"); // Remove the userName from localStorage
 
    navigate("/"); // Redirect to the home page
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/explore">Explore</Link></li>
      </ul>
      <div className="auth-buttons">
        {localStorage.getItem("token") ? (
          <>
            {userInitial && (
              <div className="user-initial" title={userName}>
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