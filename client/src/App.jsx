import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/LandingPage/ScrollToTop";
import Navbar from "./components/LandingPage/Navbar";
import Footer from "./components/LandingPage/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Search from "./pages/Search";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Progress from "./pages/ProfileSubPages/Progress";
import Reviews from "./pages/ProfileSubPages/Reviews";
import BookInfo from "./pages/BookInfo";
import Friends from "./pages/ProfileSubPages/Friends";
import Account from "./pages/ProfileSubPages/Account";
import MoodFinder from "./pages/MoodFinder";
const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/book/:volumeId" element={<BookInfo />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/account" element={<Account />} />
        <Route path="/mood" element={<MoodFinder />} />
      </Routes>
      <Footer />
    </Router>

  );
};

export default App;
