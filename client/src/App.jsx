import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/LandingPage/ScrollToTop";
import Navbar from "./components/LandingPage/Navbar";
import ThemeToggle from "./components/LandingPage/ThemeToggle";
import Footer from "./components/LandingPage/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Search from "./pages/Search";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ConfirmEmail from "./pages/ConfirmEmail";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Progress from "./pages/ProfileSubPages/Progress";
import Reviews from "./pages/ProfileSubPages/Reviews";
import BookInfo from "./pages/BookInfo";
import Friends from "./pages/ProfileSubPages/Friends";
import Account from "./pages/ProfileSubPages/Account";
import MoodFinder from "./pages/MoodFinder";
import Leaderboard from "./pages/ProfileSubPages/Leaderboard";
import useLocalStorage from "use-local-storage";
document.documentElement.setAttribute("data-theme", "light");

const App = () => {
  //add color theme logic in App.jsx because on every page load, it will store the theme
  const [isDark] = useLocalStorage("isDark", false) 
  useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            isDark ? "dark" : "light" //if isDark = true, then set the data-theme to dark, otherwise, set it to light
        )
    }, [isDark]); //only run if isDark changes dependency, not on every render of the page

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
        <Route path="/confirm" element={<ConfirmEmail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/book/:volumeId" element={<BookInfo />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/account" element={<Account />} />
        <Route path="/mood" element={<MoodFinder />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
      <Footer />
    </Router>

  );
};

export default App;
