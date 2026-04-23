import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
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

  const cellsRef = useRef(null);
  const monthsRowRef = useRef(null);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!email) return;
      try {
        const res = await getStreak(email);
        setStreakData(res.data);
      } catch (err) {
        // console.error("Failed to fetch streak:", err);
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
      // console.error("Failed to use freeze:", err);
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
    let currentWeekStart = null;

    const getWeekStart = (dateStr) => {
      const d = new Date(dateStr + "T00:00:00");
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      return d.toISOString().split("T")[0];
    };

    for (const day of activity) {
      const weekStart = getWeekStart(day.date);
      const dow = getDayOfWeek(day.date);

      if (currentWeekStart !== null && weekStart !== currentWeekStart) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }

      currentWeekStart = weekStart;
      currentWeek[dow] = day;
    }

    if (currentWeek.some((d) => d !== null)) {
      weeks.push(currentWeek);
    }

    const weekStartDates = weeks.map((week) => {
      const anyDay = week.find((d) => d !== null);
      if (!anyDay) return null;
      const d = new Date(anyDay.date + "T00:00:00");
      d.setDate(d.getDate() - d.getDay());
      return d;
    });

    const seenMonths = new Set();
    const monthFirstDays = [];

    for (const day of activity) {
      const d = new Date(day.date + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seenMonths.has(key)) {
        seenMonths.add(key);
        const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        monthFirstDays.push({
          firstOfMonth,
          label: firstOfMonth.toLocaleDateString(undefined, { month: "short" }),
        });
      }
    }

    const monthLabels = [];
    for (const { firstOfMonth, label } of monthFirstDays) {
      const firstTime = firstOfMonth.getTime();
      let bestWeekIdx = -1;

      for (let i = 0; i < weekStartDates.length; i++) {
        const sun = weekStartDates[i];
        if (!sun) continue;
        const sunTime = sun.getTime();
        const satTime = sunTime + 6 * 86400000;
        if (firstTime >= sunTime && firstTime <= satTime) {
          bestWeekIdx = i;
          break;
        }
      }

      if (bestWeekIdx === -1 && weekStartDates.length > 0) {
        const sunFirst = weekStartDates[0];
        if (sunFirst && firstOfMonth.getTime() < sunFirst.getTime()) {
          bestWeekIdx = 0;
        }
      }

      if (bestWeekIdx >= 0) {
        monthLabels.push({ label, weekIdx: bestWeekIdx });
      }
    }

    return { weeks, monthLabels };
  }, [streakData]);

  /*
   * Position month labels by measuring actual DOM column positions.
   * If a label would overlap the previous one, nudge it right
   * so both labels remain visible.
   */
  const positionMonthLabels = useCallback(() => {
    const cellsEl = cellsRef.current;
    const monthsEl = monthsRowRef.current;
    if (!cellsEl || !monthsEl) return;

    const weekColumns = cellsEl.children;
    const labelEls = monthsEl.querySelectorAll(".rs-month-label");
    if (!weekColumns.length || !labelEls.length) return;

    const cellsRect = cellsEl.getBoundingClientRect();
    const MIN_GAP = 4;
    let prevRight = -Infinity;

    labelEls.forEach((labelEl) => {
      const weekIdx = parseInt(labelEl.dataset.weekidx, 10);
      if (weekIdx >= weekColumns.length) return;

      const colRect = weekColumns[weekIdx].getBoundingClientRect();
      let leftOffset = colRect.left - cellsRect.left;

      // If this label would overlap the previous one, nudge it right
      const labelWidth = labelEl.offsetWidth || 24; // fallback estimate
      if (leftOffset < prevRight + MIN_GAP) {
        leftOffset = prevRight + MIN_GAP;
      }

      labelEl.style.left = `${leftOffset}px`;
      labelEl.style.visibility = "visible";
      prevRight = leftOffset + labelWidth;
    });
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => positionMonthLabels());
    window.addEventListener("resize", positionMonthLabels);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", positionMonthLabels);
    };
  }, [calendarData, positionMonthLabels]);

  if (loading) {
    return (
      <div className="rs-container" aria-busy="true">
        <div className="rs-loading">
          <div className="rs-loading-pulse" />
          <p>Loading your streak...</p>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="rs-container" role="alert">
        <p className="rs-error">Unable to load streak data.</p>
      </div>
    );
  }

  const { currentStreak, longestStreak, freezesRemaining, totalActiveDays } = streakData;

  return (
    <section className="rs-container" aria-label="Reading streak tracker">
      <div className="rs-header">
        <div className="rs-title-row">
          <div className="rs-flame-wrapper" aria-hidden="true">
            <svg
              className={`rs-flame ${currentStreak > 0 ? "rs-flame--active" : ""}`}
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
          <h2 className="rs-title">Reading Streak</h2>
        </div>
        <p className="rs-motivational" role="status" aria-live="polite">
          {getMotivationalMessage(currentStreak)}
        </p>
      </div>

      {/* Counters */}
      <div className="rs-counters" role="group" aria-label="Streak statistics">
        <div className="rs-stat rs-stat--current">
          <span className="rs-stat__number">{currentStreak}</span>
          <span className="rs-stat__label">Current</span>
        </div>
        <div className="rs-stat-divider" aria-hidden="true" />
        <div className="rs-stat rs-stat--longest">
          <span className="rs-stat__number">{longestStreak}</span>
          <span className="rs-stat__label">Longest</span>
        </div>
        <div className="rs-stat-divider" aria-hidden="true" />
        <div className="rs-stat rs-stat--total">
          <span className="rs-stat__number">{totalActiveDays}</span>
          <span className="rs-stat__label">Active Days</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rs-heatmap-section">
        <h4 className="rs-heatmap-title">Last 90 Days</h4>
        <div className="rs-heatmap-scroll">
          <div className="rs-heatmap-inner">

            <div className="rs-heatmap-grid">
              <div className="rs-heatmap-day-labels" aria-hidden="true">
                <span></span>
                <span>M</span>
                <span></span>
                <span>W</span>
                <span></span>
                <span>F</span>
                <span></span>
              </div>

              <div className="rs-heatmap-cells-wrapper">
                <div className="rs-heatmap-months-row" ref={monthsRowRef} aria-hidden="true">
                  {calendarData.monthLabels.map((m, i) => (
                    <span
                      key={i}
                      className="rs-month-label"
                      data-weekidx={m.weekIdx}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>

                <div className="rs-heatmap-cells" ref={cellsRef}>
                  {calendarData.weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="rs-heatmap-week">
                      {week.map((day, dayIdx) => (
                        <div
                          key={dayIdx}
                          className={`rs-heatmap-cell ${
                            day === null
                              ? "rs-heatmap-cell--empty"
                              : day.active
                              ? "rs-heatmap-cell--active"
                              : "rs-heatmap-cell--inactive"
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
            </div>

            <div className="rs-heatmap-legend">
              <span className="rs-heatmap-legend-text">Less</span>
              <div className="rs-heatmap-cell rs-heatmap-cell--inactive" />
              <div className="rs-heatmap-cell rs-heatmap-cell--active rs-heatmap-cell--low" />
              <div className="rs-heatmap-cell rs-heatmap-cell--active" />
              <span className="rs-heatmap-legend-text">More</span>
            </div>
          </div>
        </div>

        {hoveredDay && (
          <div className="rs-tooltip" style={{ left: tooltipPos.x, top: tooltipPos.y }} role="tooltip">
            <strong>{new Date(hoveredDay.date + "T00:00:00").toLocaleDateString(undefined, {
              weekday: "short", month: "short", day: "numeric",
            })}</strong>
            <span>{hoveredDay.active ? "Active" : "No activity"}</span>
          </div>
        )}
      </div>

      {/* Freeze */}
      <div className="rs-freeze-section">
        <div className="rs-freeze-info">
          <svg className="rs-freeze-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8Z" fill="#6BB8E8" stroke="#4A9FD6" strokeWidth="1" />
          </svg>
          <div>
            <p className="rs-freeze-title">Streak Freezes</p>
            <p className="rs-freeze-desc">
              {freezesRemaining > 0
                ? `${freezesRemaining} freeze${freezesRemaining !== 1 ? "s" : ""} remaining this month`
                : "No freezes remaining this month"}
            </p>
          </div>
        </div>
        {freezesRemaining > 0 && (
          <button className="rs-freeze-btn" onClick={handleFreeze} disabled={freezeLoading}>
            {freezeLoading ? "Applying..." : "Use Freeze"}
          </button>
        )}
      </div>
    </section>
  );
};

export default ReadingStreak;