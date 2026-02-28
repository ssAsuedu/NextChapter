import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ============ STREAK ROUTES (/api/streak/*) ============

router.post("/streak/log", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const today = new Date().toISOString().split("T")[0];
    if (!user.readingActivity) user.readingActivity = [];

    const alreadyLogged = user.readingActivity.some(
      (entry) => entry.date === today
    );
    if (!alreadyLogged) {
      user.readingActivity.push({ date: today, minutesRead: 0 });
    }

    await user.save();
    res.json({ message: "Activity logged", date: today });
  } catch (err) {
    console.error("Error logging streak:", err);
    res.status(500).json({ error: "Failed to log reading activity" });
  }
});

router.get("/streak/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const activity = user.readingActivity || [];
    const freezesUsed = user.streakFreezesUsed || 0;
    const MAX_FREEZES_PER_MONTH = 2;
    const activeDates = new Set(activity.map((a) => a.date));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let graceDaysUsed = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (activeDates.has(dateStr)) {
        currentStreak++;
      } else {
        if (graceDaysUsed < 1 && currentStreak > 0) {
          graceDaysUsed++;
        } else {
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const sortedDates = [...activeDates].sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
      const current = new Date(dateStr + "T00:00:00Z");
      if (prevDate) {
        const diffDays = Math.round(
          (current - prevDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays === 2) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = current;
    }

    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
    const activityMap = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(ninetyDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      activityMap.push({ date: dateStr, active: activeDates.has(dateStr) });
    }

    const freezesRemaining = Math.max(0, MAX_FREEZES_PER_MONTH - freezesUsed);

    res.json({
      currentStreak,
      longestStreak,
      activityMap,
      graceDaysUsed,
      freezesRemaining,
      totalActiveDays: activeDates.size,
    });
  } catch (err) {
    console.error("Error fetching streak:", err);
    res.status(500).json({ error: "Failed to fetch streak data" });
  }
});

router.post("/streak/freeze", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const freezesUsed = user.streakFreezesUsed || 0;
    if (freezesUsed >= 2) {
      return res.status(400).json({ error: "No freezes remaining this month" });
    }

    const today = new Date().toISOString().split("T")[0];
    if (!user.readingActivity) user.readingActivity = [];
    const alreadyLogged = user.readingActivity.some(
      (entry) => entry.date === today
    );
    if (!alreadyLogged) {
      user.readingActivity.push({ date: today, minutesRead: 0, frozen: true });
    }

    user.streakFreezesUsed = freezesUsed + 1;
    await user.save();
    res.json({
      message: "Streak freeze applied",
      freezesRemaining: 2 - (freezesUsed + 1),
    });
  } catch (err) {
    console.error("Error applying freeze:", err);
    res.status(500).json({ error: "Failed to apply streak freeze" });
  }
});

// ============ JOURNAL ROUTES (/api/journal/*) ============

router.get("/journal/:email/:volumeId", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const entries = (user.journalEntries || [])
      .filter((e) => e.volumeId === req.params.volumeId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ entries });
  } catch (err) {
    console.error("Error fetching journal:", err);
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

router.get("/journal/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    let entries = user.journalEntries || [];
    const q = req.query.q;
    if (q) {
      const lower = q.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.content.toLowerCase().includes(lower) ||
          (e.title && e.title.toLowerCase().includes(lower))
      );
    }

    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ entries });
  } catch (err) {
    console.error("Error fetching journal:", err);
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

router.post("/journal/create", async (req, res) => {
  const { email, volumeId, title, content } = req.body;
  if (!email || !volumeId || !content) {
    return res.status(400).json({ error: "Email, volumeId, and content are required" });
  }
  if (content.length > 5000) {
    return res.status(400).json({ error: "Entry exceeds 5,000 character limit" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.journalEntries) user.journalEntries = [];
    user.journalEntries.push({
      volumeId,
      title: title || "",
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await user.save();

    const created = user.journalEntries[user.journalEntries.length - 1];
    res.status(201).json({ message: "Entry created", entry: created });
  } catch (err) {
    console.error("Error creating journal entry:", err);
    res.status(500).json({ error: "Failed to create journal entry" });
  }
});

router.post("/journal/update", async (req, res) => {
  const { email, entryId, title, content } = req.body;
  if (!email || !entryId) {
    return res.status(400).json({ error: "Email and entryId are required" });
  }
  if (content && content.length > 5000) {
    return res.status(400).json({ error: "Entry exceeds 5,000 character limit" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const entry = (user.journalEntries || []).id(entryId);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    if (title !== undefined) entry.title = title;
    if (content !== undefined) entry.content = content;
    entry.updatedAt = new Date();

    await user.save();
    res.json({ message: "Entry updated", entry });
  } catch (err) {
    console.error("Error updating journal entry:", err);
    res.status(500).json({ error: "Failed to update journal entry" });
  }
});

router.post("/journal/delete", async (req, res) => {
  const { email, entryId } = req.body;
  if (!email || !entryId) {
    return res.status(400).json({ error: "Email and entryId are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const entry = (user.journalEntries || []).id(entryId);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    user.journalEntries.pull(entryId);
    await user.save();
    res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error("Error deleting journal entry:", err);
    res.status(500).json({ error: "Failed to delete journal entry" });
  }
});

// ============ MOOD ROUTES (/api/mood/*) ============

const MOOD_MAP = {
  adventurous: {
    queries: ["subject:adventure", "subject:action", "subject:thriller"],
    label: "Adventurous",
  },
  cozy: {
    queries: ["subject:romance+cozy", "subject:contemporary+fiction", "subject:domestic+fiction"],
    label: "Cozy",
  },
  "mind-bending": {
    queries: ["subject:science+fiction", "subject:philosophy", "subject:psychological+thriller"],
    label: "Mind-Bending",
  },
  heartwarming: {
    queries: ["subject:family", "subject:friendship", "subject:inspirational"],
    label: "Heartwarming",
  },
  "dark-gritty": {
    queries: ["subject:horror", "subject:crime", "subject:noir"],
    label: "Dark & Gritty",
  },
  "need-a-laugh": {
    queries: ["subject:humor", "subject:comedy", "subject:satire"],
    label: "Need a Laugh",
  },
};

router.get("/mood/moods", (req, res) => {
  const moods = Object.entries(MOOD_MAP).map(([key, val]) => ({
    id: key,
    label: val.label,
  }));
  res.json({ moods });
});

router.get("/mood/books", async (req, res) => {
  const { moods } = req.query;
  if (!moods) {
    return res.status(400).json({ error: "At least one mood is required" });
  }

  const moodList = moods.split(",").slice(0, 3);
  const GOOGLE_BOOKS_API_KEY = process.env.VITE_GOOGLE_BOOKS_API || process.env.GOOGLE_BOOKS_API_KEY;

  const queries = [];
  for (const mood of moodList) {
    const mapping = MOOD_MAP[mood];
    if (mapping) {
      const randomQuery = mapping.queries[Math.floor(Math.random() * mapping.queries.length)];
      queries.push(randomQuery);
    }
  }

  if (queries.length === 0) {
    return res.status(400).json({ error: "No valid moods provided" });
  }

  try {
    const results = await Promise.all(
      queries.map(async (q) => {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&key=${GOOGLE_BOOKS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.items || [];
      })
    );

    const seen = new Set();
    const books = [];
    for (const batch of results) {
      for (const book of batch) {
        if (!seen.has(book.id)) {
          seen.add(book.id);
          books.push(book);
        }
      }
    }

    for (let i = books.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [books[i], books[j]] = [books[j], books[i]];
    }

    res.json({ books: books.slice(0, 20) });
  } catch (err) {
    console.error("Error fetching mood books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.get("/mood/surprise", (req, res) => {
  const moodKeys = Object.keys(MOOD_MAP);
  const count = Math.floor(Math.random() * 2) + 1;
  const shuffled = moodKeys.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  res.json({
    moods: selected.map((key) => ({ id: key, label: MOOD_MAP[key].label })),
  });
});

export default router;