import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/LandingPage/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
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
          <>
            {userInitial && (
              <Link to="/profile" className="user-initial" title={userName}>
                {userInitial}
              </Link>
            )}
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login"><button>Login</button></Link>
            <Link to="/signup"><button>Sign Up</button></Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
