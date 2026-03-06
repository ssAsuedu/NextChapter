import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../../api";
import "../../styles/ProfilePage/Leaderboard.css";
import ProfileNavbar from "../../components/ProfilePage/ProfileNavbar";

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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
          </div>
        </div>

        <div className="leaderboard-card">
          {loading ? (
            <div className="leaderboard-loading">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="leaderboard-empty">No users yet.</div>
          ) : (
            rows.map((u, i) => (
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