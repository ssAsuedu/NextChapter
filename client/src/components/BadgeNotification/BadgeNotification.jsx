// BadgeNotification.jsx


import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { getBadges } from "../../api";
import "./BadgeNotification.css";

// ── Badge SVG imports ──
import HalfwayBadge from "../../assets/HalfwayBadge.svg";
import JourneyComplete from "../../assets/JourneyComplete.svg";
import NewChapter from "../../assets/NewChapter.svg";
import FutureLibrarian from "../../assets/FutureLibrarian.svg";
import CriticInTheMaking from "../../assets/CriticInTheMaking.svg";
import FirstConnection from "../../assets/FirstConnection.svg";
import ConversationStarter from "../../assets/ConversationStarter.svg";
import BookMarathoner from "../../assets/BookMarathoner.png";
import BookwormBeginner from "../../assets/BookwormBeginner.png";
import DailyReader from "../../assets/DailyReader.png";
import DeepDiver from "../../assets/DeepDiver.png";
import Explorer from "../../assets/Explorer.png";
import GenreJumper from "../../assets/GenreJumper.png";
import LibraryLegend from "../../assets/LibraryLegend.png";
import Multitasker from "../../assets/Multitasker.png";
import Newcomer from "../../assets/Newcomer.png";
import ReadingRoutine from "../../assets/ReadingRoutine.png";

// Add new badge SVGs here as you create them

// ── Badge config (add new badges here) ──
const BADGE_CONFIG = {
  NEW_CHAPTER: { name: "New Chapter", description: "Created an account", points: 10, icon: NewChapter },
  HALFWAY: { name: "Halfway There!", description: "Reached the halfway point", points: 10, icon: HalfwayBadge },
  FINISHED: { name: "Journey Complete", description: "Completed a novel", points: 25, icon: JourneyComplete },
  FUTURE_LIBRARIAN: { name: "Future Librarian", description: "Have 20+ books on your shelf", points: 30, icon: FutureLibrarian },
  CRITIC_IN_THE_MAKING: { name: "Critic in the Making", description: "Posted 10 reviews", points: 20, icon: CriticInTheMaking },
  FIRST_CONNECTION: { name: "First Connection", description: "Added your first friend", points: 10, icon: FirstConnection },
  CONVERSATION_STARTER: { name: "Conversation Starter", description: "First to review a book", points: 15, icon: ConversationStarter },
  BOOK_MARATHONER: { name: "Book Marathoner", description: "Continued activity for 1 week straight", points: 20, icon: BookMarathoner },
  GENRE_JUMPER: { name: "Genre Jumper", description: "Read across 3 different genres", points: 20, icon: GenreJumper },
  NEWCOMER: { name: "Newcomer", description: "Added your first book to your shelf", points: 10, icon: Newcomer },
  BOOKWORM_BEGINNER: { name: "Bookworm Beginner", description: "Logged your first progress session", points: 15, icon: BookwormBeginner },
  LIBRARY_LEGEND: { name: "Library Legend", description: "Reach 100 books in your library", points: 100, icon: LibraryLegend },
  READING_ROUTINE: { name: "Reading Routine", description: "Log 10 sessions in a single week", points: 30, icon: ReadingRoutine },
  DAILY_READER: { name: "Daily Reader", description: "Log reading 3 days in a row", points: 15, icon: DailyReader },
  DEEP_DIVER: { name: "Deep Diver", description: "Read 100+ pages in one session", points: 20, icon: DeepDiver },
  MULTITASKER: { name: "Multitasker", description: "Have three books in progress at once", points: 30, icon: Multitasker },
  EXPLORER: { name: "Explorer", description: "Have books from 5 different genres in your bookshelf", points: 30, icon: Explorer },
};

// ── URLs that can award badges (matches server.js) ──
const BADGE_TRIGGER_URLS = [
  "/progress/update",
  "/bookshelf/add",
  "/reviews/add",
  "/friends/request/accept",
];

// ── Toast component ──
// `notification` is now always an ARRAY of badge objects (or null).
// When the array has 1 badge → single badge view
// When the array has 2+ badges → grouped view with all icons in a row
const BadgeToast = ({ notification, onDismiss, autoDismissMs = 6000 }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (notification && notification.length > 0) {
      setExiting(false);
      requestAnimationFrame(() => setVisible(true));
      // Longer auto-dismiss for grouped notifications so users can see all badges
      const dismissTime = notification.length > 1 ? autoDismissMs + 2000 : autoDismissMs;
      const timer = setTimeout(() => handleDismiss(), dismissTime);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      onDismiss?.();
    }, 400);
  };

  if (!notification || notification.length === 0) return null;

  const isGrouped = notification.length > 1;
  const totalPoints = notification.reduce((sum, b) => sum + (b.points || 0), 0);

  return (
    <div
      className={`badge-notif-overlay ${visible && !exiting ? "badge-notif-enter" : ""} ${exiting ? "badge-notif-exit" : ""}`}
      onClick={handleDismiss}
    >
      <div
        className={`badge-notif-card ${isGrouped ? "badge-notif-card--grouped" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="badge-notif-sparkle sparkle-1">✦</div>
        <div className="badge-notif-sparkle sparkle-2">✦</div>
        <div className="badge-notif-sparkle sparkle-3">⟡</div>

        <div className="badge-notif-header">
          {isGrouped ? `You earned ${notification.length} new badges!` : "Badge Earned!"}
        </div>

        {isGrouped ? (
          // Grouped view — show all icons in a row
          <>
            <div className="badge-notif-group">
              {notification.map((b, i) => (
                <div
                  key={i}
                  className="badge-notif-group-item"
                  style={{ animationDelay: `${0.15 + i * 0.1}s` }}
                >
                  <div className="badge-notif-group-icon-wrap">
                    <img src={b.icon} alt={b.name} className="badge-notif-group-icon" />
                  </div>
                  <div className="badge-notif-group-name">{b.name}</div>
                </div>
              ))}
            </div>
            <div className="badge-notif-points">+{totalPoints} pts total</div>
          </>
        ) : (
          // Single badge view (original layout)
          <>
            <div className="badge-notif-icon-wrap">
              <div className="badge-notif-glow" />
              <img src={notification[0].icon} alt={notification[0].name} className="badge-notif-icon" />
            </div>
            <div className="badge-notif-name">{notification[0].name}</div>
            <div className="badge-notif-desc">{notification[0].description}</div>
            <div className="badge-notif-points">+{notification[0].points} pts</div>
          </>
        )}

        <button className="badge-notif-dismiss" onClick={handleDismiss}>Nice!</button>
      </div>
    </div>
  );
};

// ── Context + Provider (wrap your app with this in App.jsx) ──
const BadgeContext = createContext();
export const useBadgeCheck = () => useContext(BadgeContext);

const BadgeProvider = ({ children }) => {
  // `notification` is now an array of badges (batched from a single check)
  const [notification, setNotification] = useState(null);
  const knownBadgesRef = useRef(null);
  const interceptorSetup = useRef(false);

  // Snapshot existing badges on load so old badges don't trigger toasts
  useEffect(() => {
    const init = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      try {
        const res = await getBadges(email);
        const badges = res.data.badges || [];
        const map = {};
        badges.forEach((b) => { map[b.type] = (map[b.type] || 0) + 1; });
        knownBadgesRef.current = map;
      } catch (err) {
        // console.error("Badge init failed:", err);
      }
    };
    init();
  }, []);

  const triggerBadgeCheck = useCallback(async () => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;
    try {
      const res = await getBadges(email);
      const badges = res.data.badges || [];
      const newMap = {};
      badges.forEach((b) => { newMap[b.type] = (newMap[b.type] || 0) + 1; });

      if (knownBadgesRef.current === null) {
        knownBadgesRef.current = newMap;
        return;
      }

      const prevMap = knownBadgesRef.current;
      const newBadges = [];
      Object.keys(newMap).forEach((type) => {
        if ((newMap[type] || 0) > (prevMap[type] || 0)) {
          const config = BADGE_CONFIG[type];
          if (config) newBadges.push({ type, ...config });
        }
      });
      knownBadgesRef.current = newMap;

      // Batch: show all new badges from this check in a single grouped notification
      if (newBadges.length > 0) {
        setNotification(newBadges);
      }
    } catch (err) {
      // console.error("Badge check failed:", err);
    }
  }, []);

  // Axios interceptor — auto-checks for badges after triggering endpoints
  useEffect(() => {
    if (interceptorSetup.current) return;
    interceptorSetup.current = true;

    axios.interceptors.response.use((response) => {
      const url = response.config?.url || "";
      const isTrigger = BADGE_TRIGGER_URLS.some((path) => url.includes(path));
      if (isTrigger && response.status >= 200 && response.status < 300) {
        setTimeout(() => triggerBadgeCheck(), 500);
      }
      return response;
    }, (error) => Promise.reject(error));
  }, [triggerBadgeCheck]);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <BadgeContext.Provider value={{ triggerBadgeCheck }}>
      {children}
      <BadgeToast notification={notification} onDismiss={dismissNotification} />
    </BadgeContext.Provider>
  );
};

export default BadgeProvider;