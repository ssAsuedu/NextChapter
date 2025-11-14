import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/LandingPage/Navbar";
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

const App = () => {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
};

export default App;