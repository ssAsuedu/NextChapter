import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/LandingPage/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    alert("You have been signed out.");
    navigate("/"); // Redirect to the home page
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
      <div className="auth-buttons">
        {localStorage.getItem("token") ? (
          <button onClick={handleSignOut}>Sign Out</button>
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