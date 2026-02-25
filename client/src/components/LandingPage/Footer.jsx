import React from "react";
import '../../styles/LandingPage/Footer.css'
const Footer = () => {
    return ( 
        <footer>
            <div className="content-wrapper">
                <div className="team-info">
                    <p className="team-content name">Next Chapter</p> 
                    <p className="team-content description">Discover books, track your progress, and celebrate every chapter.</p>
                </div>
                <div className="navigation-links">
                    <nav className="nav-sections">
                        <ul className="discover-section"><span className="footer-header">Discover</span>
                            <li><a className="footer-links" href="/">Home</a></li>
                            <li><a className="footer-links" href="/search">Search Books</a></li>
                            <li><a className="footer-links desktop-only" href="/explore">Explore Books</a></li>
                        </ul>
                        <ul className="about-us-section"><span className="footer-header">About</span>
                        <li><a className="footer-links" href="/about">About Us</a></li>
                            <li><a className="footer-links" href="/about#mission">Our Mission</a></li>
                            <li><a className="footer-links" href="/about#what-we-offer">What We Offer</a></li>
                        </ul>
                        <ul className="profile-section"><span className="footer-header">Profile</span>
                            <li><a className="footer-links" href="/profile"> My Profile</a></li>
                            <li><a className="footer-links" href="/progress">Book Progress</a></li>
                            <li><a className="footer-links desktop-only" href="/reviews">Reviews</a></li>
                            <li><a className="footer-links desktop-only" href="/friends">Friends</a></li>
                        </ul>
                        <ul className="support-section"><span className="footer-header">Support</span>
                            <li><a className="footer-links" href="/privacyPolicy">Privacy Policy</a></li>
                            <li><a className="footer-links" href="/account">Account</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    )
}

export default Footer;