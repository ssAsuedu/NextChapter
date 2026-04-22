import { useEffect, useState } from "react";
import { getLeaderboard, getFriends } from "../../api";
import "../../styles/ProfilePage/Leaderboard.css";
import ProfileNavbar from "../../components/ProfilePage/ProfileNavbar";
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

const badgeIconMap = {
  HALFWAY: HalfwayBadge,
  FINISHED: JourneyComplete,
  JOURNEY_COMPLETE: JourneyComplete,
  NEW_CHAPTER: NewChapter,
  FUTURE_LIBRARIAN: FutureLibrarian,
  CONVERSATION_STARTER: ConversationStarter,
  FIRST_CONNECTION: FirstConnection,
  CRITIC_IN_THE_MAKING: CriticInTheMaking,
  BOOK_MARATHONER: BookMarathoner,
  BOOKWORM_BEGINNER: BookwormBeginner,
  DAILY_READER: DailyReader,
  DEEP_DIVER: DeepDiver,
  EXPLORER: Explorer,
  GENRE_JUMPER: GenreJumper,
  LIBRARY_LEGEND: LibraryLegend,
  MULTITASKER: Multitasker,
  NEWCOMER: Newcomer,
  READING_ROUTINE: ReadingRoutine,
};

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const limit = 50;
  const [loading, setLoading] = useState(true);
  const currentUserEmail = localStorage.getItem("userEmail") || "";
  // add states to show friends only in the leaderboard upon toggle 
  const [activeBadgeIndex, setActiveBadgeIndex] = useState({});
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadedBadgeSrcs, setLoadedBadgeSrcs] = useState({});

  const markBadgeSrcLoaded = (src) => {
    if (!src) return;

    setLoadedBadgeSrcs((prev) => {
      if (prev[src]) return prev;
      return {
        ...prev,
        [src]: true,
      };
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getLeaderboard(limit);
        setRows(res.data.leaderboard || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [limit]);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        if (!currentUserEmail) return;

        const response = await getFriends(currentUserEmail);
        setFriends(response.data || []);
      } catch {
        //console.error("Error loading friends:", err);
      }
    };

    loadFriends();
  }, [currentUserEmail]);

  useEffect(() => {
    const allBadgeSrcs = Array.from(new Set(Object.values(badgeIconMap)));

    allBadgeSrcs.forEach((src) => {
      const img = new Image();
      img.onload = () => markBadgeSrcLoaded(src);
      img.onerror = () => markBadgeSrcLoaded(src);
      img.src = src;
    });
  }, []);

  const filteredRows = showFriendsOnly
    ? rows.filter((u) =>
      friends.some(
        (friend) =>
          friend.email?.trim().toLowerCase() ===
          u.email?.trim().toLowerCase()
      )
    )
    : rows;

  const changeBadge = (userKey, direction, badgeCount) => {
    if (!badgeCount) return;

    setActiveBadgeIndex((prev) => {
      const current = prev[userKey] ?? 0;
      const next = (current + direction + badgeCount) % badgeCount;

      return {
        ...prev,
        [userKey]: next,
      };
    });
  };

  return (
    <div>
      <ProfileNavbar />

      <div className="leaderboard-page">
        <div className="leaderboard-header">
          <div>
            <h1 className="leaderboard-title">Leaderboard</h1>
            <p className="leaderboard-subtitle">
              Points are earned from badges across the app.
            </p>
            <div className="leaderboard-toggle">
              <input
                type="checkbox"
                className="leaderboard-toggle-checkbox"
                id="leaderboardToggle"
                checked={showFriendsOnly}
                onChange={() => setShowFriendsOnly((prev) => !prev)}
              />
              <label
                className="leaderboard-toggle-label"
                htmlFor="leaderboardToggle"
              >
                <span className="leaderboard-toggle-inner" />
                <span className="leaderboard-toggle-switch" />
              </label>

              <span className="leaderboard-toggle-text">
                {showFriendsOnly ? "Friends Only" : "All Users"}
              </span>
            </div>
          </div>
        </div>

        <div className="leaderboard-card">
          {loading ? (
            <div className="leaderboard-loading">Loading...</div>
          ) : filteredRows.length === 0 ? (
            <div className="leaderboard-empty">No users yet.</div>
          ) : (
            filteredRows.map((u, i) => (
              <div className="leaderboard-wrapper" key={`${u.name}-${i}`}>
                <div className="leaderboard-row">
                  <div className="leaderboard-user">
                    <div className="leaderboard-rank">
                      <h2>#{i + 1}</h2>
                    </div>
                    <div className="leaderboard-text">
                      <h3 className="leaderboard-name">{u.name}</h3>
                      <p className="leaderboard-smalltext">
                        {u.badgeCount} badges
                      </p>
                    </div>
                  </div>
                  <div className="leaderboard-badges-wrap">
                    {u.badgeBreakdown && Object.entries(u.badgeBreakdown).length > 0 && (
                      <button
                        className="scroll-btn left"
                        onClick={() =>
                          changeBadge(
                            u.email,
                            -1,
                            Object.entries(u.badgeBreakdown).length
                          )
                        }
                      >
                        ‹
                      </button>
                    )}

                    <div
                      className="leaderboard-badges-slider"
                      onTouchStart={(e) => {
                        if (window.innerWidth > 768) return;
                        e.currentTarget.dataset.startX = e.touches[0].clientX;
                      }}
                      onTouchEnd={(e) => {
                        if (window.innerWidth > 768) return;

                        const startX = Number(e.currentTarget.dataset.startX);
                        if (!startX) return;

                        const endX = e.changedTouches[0].clientX;
                        const diff = startX - endX;

                        if (Math.abs(diff) > 40) {
                          changeBadge(
                            u.email,
                            diff > 0 ? 1 : -1,
                            u.badgeBreakdown
                              ? Object.entries(u.badgeBreakdown).length
                              : 0
                          );
                        }

                        e.currentTarget.dataset.startX = "";
                      }}
                    >
                      {u.badgeBreakdown
                        ? Object.entries(u.badgeBreakdown).map(
                          ([type, count], index, arr) => {
                            const badgeSrc = badgeIconMap[type];
                            const current = activeBadgeIndex[u.email] ?? 0;
                            const prevIndex =
                              (current - 1 + arr.length) % arr.length;
                            const nextIndex = (current + 1) % arr.length;

                            let positionClass = "is-hidden";

                            if (index === current) {
                              positionClass = "is-active";
                            } else if (index === prevIndex) {
                              positionClass = "is-prev";
                            } else if (index === nextIndex) {
                              positionClass = "is-next";
                            }

                            return (
                              <div
                                className={`leaderboard-badge-slide ${positionClass}`}
                                key={type}
                              >
                                {badgeSrc ? (
                                  <div className="leaderboard-badge-icon-wrap">
                                    {!loadedBadgeSrcs[badgeSrc] && (
                                      <span
                                        className="leaderboard-badge-spinner"
                                        aria-label="Loading badge icon"
                                      />
                                    )}
                                    <img
                                      src={badgeSrc}
                                      alt={type}
                                      className={`leaderboard-badge-icon ${loadedBadgeSrcs[badgeSrc] ? "is-loaded" : "is-loading"}`}
                                      title={`${type.replaceAll("_", " ")} ×${count}`}
                                      loading="lazy"
                                      decoding="async"
                                      onLoad={() => markBadgeSrcLoaded(badgeSrc)}
                                      onError={() => markBadgeSrcLoaded(badgeSrc)}
                                    />
                                  </div>
                                ) : (
                                  <span className="leaderboard-badge-oval-fallback">
                                    {type.replaceAll("_", " ")}
                                  </span>
                                )}
                                <span className="leaderboard-badge-count">
                                  ×{count}
                                </span>
                              </div>
                            );
                          }
                        )
                        : null}
                    </div>

                    {u.badgeBreakdown && Object.entries(u.badgeBreakdown).length > 0 && (
                      <button
                        className="scroll-btn right"
                        onClick={() =>
                          changeBadge(
                            u.email,
                            1,
                            Object.entries(u.badgeBreakdown).length
                          )
                        }
                      >
                        ›
                      </button>
                    )}
                  </div>
                  <div className="leaderboard-score">{u.score} pts</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;