import React, { useEffect, useState, useMemo } from "react";
import { getStreak, useStreakFreeze } from "../../api";
import "../../styles/ProfilePage/ReadingStreak.css";

const getMotivationalMessage = (streak) => {
  if (streak === 0) return "Start your reading journey today -- every page counts.";
  if (streak === 1) return "Great start! One day down, keep the momentum going.";
  if (streak <= 3) return "You're building a habit. Stay consistent!";
  if (streak <= 7) return "A full week of reading is within reach.";
  if (streak <= 14) return "Two weeks strong! You're becoming a dedicated reader.";
  if (streak <= 30) return "Incredible discipline. A whole month of reading awaits.";
  if (streak <= 60) return "You're a reading machine. Your dedication is inspiring.";
  if (streak <= 100) return "Legendary streak -- you're in the top tier of readers.";
  return "Unstoppable. You've mastered the art of daily reading.";
};

const getMonthLabel = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short" });
};

const getDayOfWeek = (dateStr) => {
  return new Date(dateStr + "T00:00:00").getDay();
};

const ReadingStreak = () => {
  const email = localStorage.getItem("userEmail");
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchStreak = async () => {
      if (!email) return;
      try {
        const res = await getStreak(email);
        setStreakData(res.data);
      } catch (err) {
        console.error("Failed to fetch streak:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, [email]);

  const handleFreeze = async () => {
    if (!email || freezeLoading) return;
    setFreezeLoading(true);
    try {
      await useStreakFreeze({ email });
      const res = await getStreak(email);
      setStreakData(res.data);
    } catch (err) {
      console.error("Failed to use freeze:", err);
    } finally {
      setFreezeLoading(false);
    }
  };

  const handleMouseEnter = (day, event) => {
    const rect = event.target.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  const calendarData = useMemo(() => {
    if (!streakData?.activityMap) return { weeks: [], monthLabels: [] };

    const activity = streakData.activityMap;
    if (activity.length === 0) return { weeks: [], monthLabels: [] };

    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    let currentWeekStart = null; // Track which Sun-Sat week we're in

    // Helper: get the Sunday that starts the week containing dateStr
    const getWeekStart = (dateStr) => {
      const d = new Date(dateStr + "T00:00:00");
      const day = d.getDay(); // 0=Sun
      d.setDate(d.getDate() - day);
      return d.toISOString().split("T")[0];
    };

    for (const day of activity) {
      const weekStart = getWeekStart(day.date);
      const dow = getDayOfWeek(day.date);

      // If we've moved to a new week, push the old one and start fresh
      if (currentWeekStart !== null && weekStart !== currentWeekStart) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }

      currentWeekStart = weekStart;
      currentWeek[dow] = day;
    }

    // Push the final week
    if (currentWeek.some((d) => d !== null)) {
      weeks.push(currentWeek);
    }

    // Month labels positioned by week index
    const monthLabels = [];
    let lastMonth = "";
    weeks.forEach((week, weekIdx) => {
      const firstDay = week.find((d) => d !== null);
      if (firstDay) {
        const month = getMonthLabel(firstDay.date);
        if (month !== lastMonth) {
          monthLabels.push({ label: month, weekIdx });
          lastMonth = month;
        }
      }
    });

    return { weeks, monthLabels };
  }, [streakData]);

  if (loading) {
    return (
      <div className="streak-container" aria-busy="true">
        <div className="streak-loading">
          <div className="streak-loading-pulse" />
          <p>Loading your streak...</p>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="streak-container" role="alert">
        <p className="streak-error">Unable to load streak data.</p>
      </div>
    );
  }

  const { currentStreak, longestStreak, freezesRemaining, totalActiveDays } = streakData;

  return (
    <section className="streak-container" aria-label="Reading streak tracker">
      <div className="streak-header">
        <div className="streak-title-row">
          <div className="streak-flame-wrapper" aria-hidden="true">
            <svg
              className={`streak-flame ${currentStreak > 0 ? "streak-flame--active" : ""}`}
              viewBox="0 0 24 32"
              fill="none"
            >
              <path
                d="M12 0C12 0 4 10 4 18C4 24.627 7.373 28 12 30C16.627 28 20 24.627 20 18C20 10 12 0 12 0Z"
                fill={currentStreak > 0 ? "url(#flame-gradient)" : "#ccc"}
              />
              <path
                d="M12 12C12 12 8 18 8 22C8 25.314 9.791 27 12 28C14.209 27 16 25.314 16 22C16 18 12 12 12 12Z"
                fill={currentStreak > 0 ? "url(#flame-inner)" : "#ddd"}
              />
              <defs>
                <linearGradient id="flame-gradient" x1="12" y1="0" x2="12" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6B35" />
                  <stop offset="1" stopColor="#F7931A" />
                </linearGradient>
                <linearGradient id="flame-inner" x1="12" y1="12" x2="12" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFD23F" />
                  <stop offset="1" stopColor="#FF9E1B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3 className="streak-title">Reading Streak</h3>
        </div>
        <p className="streak-motivational" role="status" aria-live="polite">
          {getMotivationalMessage(currentStreak)}
        </p>
      </div>

      {/* Counters */}
      <div className="streak-counters" role="group" aria-label="Streak statistics">
        <div className="streak-stat streak-stat--current">
          <span className="streak-stat__number">{currentStreak}</span>
          <span className="streak-stat__label">Current</span>
        </div>
        <div className="streak-stat-divider" aria-hidden="true" />
        <div className="streak-stat streak-stat--longest">
          <span className="streak-stat__number">{longestStreak}</span>
          <span className="streak-stat__label">Longest</span>
        </div>
        <div className="streak-stat-divider" aria-hidden="true" />
        <div className="streak-stat streak-stat--total">
          <span className="streak-stat__number">{totalActiveDays}</span>
          <span className="streak-stat__label">Active Days</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="streak-heatmap-section">
        <h4 className="streak-heatmap-title">Last 90 Days</h4>
        <div className="streak-heatmap-scroll">
          {/* Month labels */}
          <div className="streak-heatmap-months" aria-hidden="true">
            <div className="streak-heatmap-day-labels-spacer" />
            {calendarData.weeks.map((_, weekIdx) => {
              const label = calendarData.monthLabels.find((m) => m.weekIdx === weekIdx);
              return (
                <div key={weekIdx} className="streak-heatmap-month-slot">
                  {label ? <span>{label.label}</span> : null}
                </div>
              );
            })}
          </div>

          <div className="streak-heatmap-grid">
            <div className="streak-heatmap-day-labels" aria-hidden="true">
              <span></span>
              <span>M</span>
              <span></span>
              <span>W</span>
              <span></span>
              <span>F</span>
              <span></span>
            </div>

            <div className="streak-heatmap-cells">
              {calendarData.weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="streak-heatmap-week">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`streak-heatmap-cell ${
                        day === null
                          ? "streak-heatmap-cell--empty"
                          : day.active
                          ? "streak-heatmap-cell--active"
                          : "streak-heatmap-cell--inactive"
                      }`}
                      onMouseEnter={(e) => day && handleMouseEnter(day, e)}
                      onMouseLeave={() => setHoveredDay(null)}
                      tabIndex={day ? 0 : -1}
                      role={day ? "gridcell" : "presentation"}
                      aria-label={day ? `${day.date}: ${day.active ? "Active" : "No activity"}` : undefined}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="streak-heatmap-legend">
            <span className="streak-heatmap-legend-text">Less</span>
            <div className="streak-heatmap-cell streak-heatmap-cell--inactive" />
            <div className="streak-heatmap-cell streak-heatmap-cell--active streak-heatmap-cell--low" />
            <div className="streak-heatmap-cell streak-heatmap-cell--active" />
            <span className="streak-heatmap-legend-text">More</span>
          </div>
        </div>

        {hoveredDay && (
          <div className="streak-tooltip" style={{ left: tooltipPos.x, top: tooltipPos.y }} role="tooltip">
            <strong>{new Date(hoveredDay.date + "T00:00:00").toLocaleDateString(undefined, {
              weekday: "short", month: "short", day: "numeric",
            })}</strong>
            <span>{hoveredDay.active ? "Active" : "No activity"}</span>
          </div>
        )}
      </div>

      {/* Freeze */}
      <div className="streak-freeze-section">
        <div className="streak-freeze-info">
          <svg className="streak-freeze-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8Z" fill="#6BB8E8" stroke="#4A9FD6" strokeWidth="1" />
          </svg>
          <div>
            <p className="streak-freeze-title">Streak Freezes</p>
            <p className="streak-freeze-desc">
              {freezesRemaining > 0
                ? `${freezesRemaining} freeze${freezesRemaining !== 1 ? "s" : ""} remaining this month`
                : "No freezes remaining this month"}
            </p>
          </div>
        </div>
        {freezesRemaining > 0 && (
          <button className="streak-freeze-btn" onClick={handleFreeze} disabled={freezeLoading}>
            {freezeLoading ? "Applying..." : "Use Freeze"}
          </button>
        )}
      </div>
    </section>
  );
};

export default ReadingStreak;