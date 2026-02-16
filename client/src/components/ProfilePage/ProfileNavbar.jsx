import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/ProfilePage/ProfileNavbar.css";


const ProfileNavbar = () => {
 const [open, setOpen] = useState(false);


 return (
   <>
     <nav className={`profile-vertical-navbar ${open ? "open" : ""}`}>
       <ul>
         <li><Link to="/profile">Bookshelf</Link></li>
         <li><Link to="/progress">Progress</Link></li>
         <li><Link to="/reviews">Reviews</Link></li>
         <li><Link to="/friends">Friends</Link></li>
         <li><Link to="/account">Account</Link></li>
       </ul>
     </nav>
     {open && <div className="overlay" onClick={() => setOpen(false)}></div>}
   </>
 );
};


export default ProfileNavbar;



