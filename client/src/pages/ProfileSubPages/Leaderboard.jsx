import React, { useEffect, useState } from "react";
import { getLeaderboard, getFriends } from "../../api";
import "../../styles/ProfilePage/Leaderboard.css";
import ProfileNavbar from "../../components/ProfilePage/ProfileNavbar";


const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const currentUserEmail = localStorage.getItem("userEmail") || "";
  // add states to show friends only in the leaderboard upon toggle 
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [friends, setFriends] = useState([]);
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

        const response = await getFriends(currentUserEmail); // ← NEW API call
        setFriends(response.data || []); // ← NEW
      } catch (err) {
        console.error("Error loading friends:", err);
      }
    };

    loadFriends();
  }, [currentUserEmail]);

  const filteredRows = showFriendsOnly
      ? rows.filter((u) =>
        friends.some(
          (friend) =>
            friend.email?.trim().toLowerCase() ===
            u.email?.trim().toLowerCase()
        )
      )
    : rows;

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
                <div className="leaderboard-badges">
                  {u.badgeBreakdown
                    ? Object.entries(u.badgeBreakdown)
                      .slice(0, 3)
                      .map(([type, count]) => (
                        <span className="leaderboard-badge-oval" key={type}>
                          {type.replaceAll("_", " ")} ×{count}
                        </span>
                      ))
                    : null}
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