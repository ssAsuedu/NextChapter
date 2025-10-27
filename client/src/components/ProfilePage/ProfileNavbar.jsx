import React from "react";
import { Link } from "react-router-dom";
import "../../styles/ProfilePage/Profile.css";

const ProfileNavbar = () => {
  return (
    <nav className="profile-vertical-navbar">
      <ul>
        <li><Link to="/profile">Bookshelf</Link></li>
        <li><Link to="/progress">Progress</Link></li>
        <li><Link to="/reviews">Reviews</Link></li>
        <li><Link to="/friends">Friends</Link></li>
        <li><Link to="/account">Account</Link></li>
      </ul>
    </nav>
  );
};

export default ProfileNavbar;