import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import User from "./models/User.js";
import Review from "./models/Review.js";
import FriendRequest from "./models/FriendRequest.js";
import List from "./models/List.js";
import featureRoutes from "./models/featureRoutes.js";
import Message from "./models/Message.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Trust proxy (HTTPS via LB) and middleware
app.set("trust proxy", 1);

const hasBadge = (user, badgeType, volumeId = null) => {
  return (user.badges || []).some(
    (b) => b.type === badgeType && (volumeId ? b.volumeId === volumeId : true)
  );
};

// award badge helper function so that no duplicates are awarded to one user 
const awardBadge = (user, badgeType, volumeId = null) => {
  if (!hasBadge(user, badgeType, volumeId)) {
    user.badges = user.badges || [];
    user.badges.push({
      type: badgeType,
      ...(volumeId ? { volumeId } : {}),
      earnedAt: new Date(),
    });
  }
};

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
};

app.use(cors(corsOptions));
//app.use(cors());
app.options(/.*/, cors(corsOptions));


app.use(express.json());
app.use(morgan("combined"));
app.use("/api", featureRoutes);

// MongoDB connection with env switch
const isProd = process.env.NODE_ENV === "production";
const mongoUri = isProd ? process.env.MONGO_PROD_URI : process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Missing Mongo URI. Set MONGO_PROD_URI (prod) or MONGO_URI (dev).");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    const c = mongoose.connection;
    console.log(`Mongo connected: env=${isProd ? "prod" : "dev"}, db=${c.name}, host=${c.host}`);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Cognito
const poolData = isProd
  ? { UserPoolId: process.env.COGNITO_USER_POOL_ID_PROD, ClientId: process.env.COGNITO_APP_CLIENT_ID_PROD }
  : { UserPoolId: process.env.COGNITO_USER_POOL_ID, ClientId: process.env.COGNITO_APP_CLIENT_ID };

if (!poolData.UserPoolId || !poolData.ClientId) {
  console.error("Missing Cognito env vars for current environment.");
  process.exit(1);
}
const userPool = new CognitoUserPool(poolData);

// Health
app.get("/health/db", (req, res) => {
  const c = mongoose.connection;
  res.json({ env: isProd ? "prod" : "dev", db: c.name, host: c.host, readyState: c.readyState });
});

// Sign-Up
app.post("/api/signup", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });

  const attributeList = [
    new CognitoUserAttribute({ Name: "email", Value: email }),
    new CognitoUserAttribute({ Name: "name", Value: name }),
  ];

  userPool.signUp(email, password, attributeList, null, async (err, result) => {
    if (err) {
      console.error("Cognito signup error:", { code: err.code, message: err.message });
      return res.status(400).json({ error: err.code || "BadRequest", message: err.message });
    }
    try {
      // Add the user to MongoDB and give the NewChapter badge
      const newUser = new User({
        name,
        email,
        badges: [{ type: "NEW_CHAPTER" }],
      });
      await newUser.save();
      res.json({ message: "Sign-up successful and user added to database", user: result.user });
    } catch (dbError) {
      console.error("Error saving user to database:", dbError);
      res.status(500).json({ error: "Failed to save user to database" });
    }
  });
});

app.post("/api/resend-code", (req, res) => {
    const {email} = req.body;
    console.log("Email received:", email);
    
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });
    console.log("Email received:", email);
    cognitoUser.resendConfirmationCode((err, result) => { //Cognito's API to generate new confirmation code
      if(err) {
        console.error("Resend error:", err);
        return res.status(400).json({ error: err.message }); //error
      }
      res.json({ message: "Confirmation code resent! Check your inbox."}); //code sent successfully
      console.log("Confirmation code resent successfully:", result);
    });
});
// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  user.authenticateUser(authDetails, {
    onSuccess: async (result) => {
      const accessToken = result.getAccessToken().getJwtToken();
      const idToken = result.getIdToken().getJwtToken();

      let userInfo = null;
      try {
        userInfo = await User.findOne({ email });
      } catch (dbError) {
        console.error("Error retrieving user from database:", dbError);
      }

      res.json({
        message: "Login successful",
        token: accessToken,
        idToken,
        user: userInfo,
      });
    },
    onFailure: (err) => {
      console.error("Login error:", err);

      if (err.code === "UserNotConfirmedException") {
        return res.status(403).json({
          error: "User is not confirmed.",
          message: "Your email is not confirmed."
        })
      }
      res.status(401).json({ error: err.message || "Login failed" });
    },
  });
});

// Confirm Registration Route
app.post("/api/confirm", (req, res) => {
  const { email, code } = req.body;

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  user.confirmRegistration(code, true, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "Email confirmed successfully!", result });
  });
});

// Add book to user's bookshelf
app.post("/api/bookshelf/add", async (req, res) => {
  const { email, volumeId } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.bookshelf.includes(volumeId)) {
      user.bookshelf.push(volumeId);
      // if user adds first book 
      if (user.bookshelf.length >= 1) {
        awardBadge(user, "NEWCOMER");
      }
      // if user has 20+ books in shelf, then they earn the future librarian badge 
      if (user.bookshelf.length >= 20) {
        awardBadge(user, "FUTURE_LIBRARIAN");
      }
      // if user has 100+ books then they earn library legend
      if (user.bookshelf.length >= 100) {
        awardBadge(user, "LIBRARY_LEGEND");
      }
      await user.save();
    }
    res.json({ message: "Book added to bookshelf", bookshelf: user.bookshelf });
  } catch (err) {
    res.status(500).json({ error: "Failed to add book" });
  }
});

// Delete book from user's bookshelf
app.post("/api/bookshelf/delete", async (req, res) => {
  const { email, volumeId } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.bookshelf = user.bookshelf.filter(id => id !== volumeId);
    await user.save();
    res.json({ message: "Book removed from bookshelf", bookshelf: user.bookshelf });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove book" });
  }
});

// Get user's bookshelf
app.get("/api/bookshelf/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ bookshelf: user.bookshelf });
  } catch (err) {
    res.status(500).json({ error: "Failed to get bookshelf" });
  }
});

// Create a new list
app.post("/api/lists", async (req, res) => {
  const { email, name, description, privacy, books } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: "Email and list name are required" });
  }
  
  try {
    const newList = new List({
      email,
      name,
      description: description || "",
      privacy: privacy || "private",
      books: books || []
    });
  
    await newList.save();

    res.status(201).json({ message: "List created successfully", list: newList });
  } catch (err) {
    console.error("Create list error:", err);
    res.status(500).json({ error: "Failed to create list" });
  }
});
  
// Edit a list
app.post("/api/lists/edit", async (req, res) => {
  const { email, listId, name, description, privacy, books, pinned } = req.body;
  
  try {
    const list = await List.findOne({ _id: listId, email });
  
    if (!list) {
      return res.status(404).json({ error: "List not found for this user" });
    }
  
    if (name !== undefined) list.name = name;
    if (description !== undefined) list.description = description;
    if (privacy !== undefined) list.privacy = privacy;
    if (books !== undefined) list.books = books;
    if (pinned !== undefined) list.pinned = pinned;
  
    await list.save();
  
    res.json({
      message: "List updated successfully",
      list
    });
  
  } catch (err) {
    console.error("Edit list error:", err);
    res.status(500).json({ error: "Failed to edit list" });
  }
});
  
// Delete a list
app.delete("/api/lists/:id", async (req, res) => {
  try {
    const deletedList = await List.findByIdAndDelete(req.params.id);
  
    if (!deletedList) {
      return res.status(404).json({ error: "List not found" });
    }
  
    res.json({ message: "List deleted successfully" });
  } catch (err) {
    console.error("Delete list error:", err);
    res.status(500).json({ error: "Failed to delete list" });
  }
});
  
// Get all lists for a user
app.get("/api/lists/:email", async (req, res) => {
  try {
    const lists = await List.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    console.error("Fetch lists error:", err);
    res.status(500).json({ error: "Failed to fetch lists" });
  }
});

// Get progress for all books
app.get("/api/progress/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ progress: user.progress || [] });
});

// Update progress for a book
app.post("/api/progress/update", async (req, res) => {
  const { email, volumeId, currentPage, totalPages } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const safeTotal = Math.max(0, Number(totalPages) || 0);
  const safeCurrent = Math.max(0, Math.min(Number(currentPage) || 0, safeTotal));

  const idx = user.progress.findIndex((p) => p.volumeId === volumeId);

  // capture old page BEFORE updating so we can compute the session delta for DEEP_DIVER
  const oldPage = idx > -1 ? (Number(user.progress[idx].currentPage) || 0) : 0;

  if (idx > -1) {
    user.progress[idx].currentPage = currentPage;
    user.progress[idx].totalPages = totalPages;
  } else {
    user.progress.push({ volumeId, currentPage, totalPages });
  }

  // ── BADGE LOGIC ──
  // HALFWAY: reached 50% of a book (one per book)
  const percent = safeTotal > 0 ? safeCurrent / safeTotal : 0;
  if (safeTotal > 0 && percent >= 0.5) {
    awardBadge(user, "HALFWAY", volumeId);
  }

  // BOOKWORM_BEGINNER: first progress session ever
  if ((user.progress || []).length >= 1) {
    awardBadge(user, "BOOKWORM_BEGINNER");
  }

  // DEEP_DIVER: 100+ pages in a single session
  const pagesReadThisSession = safeCurrent - oldPage;
  if (pagesReadThisSession >= 100) {
    awardBadge(user, "DEEP_DIVER");
  }

  // MULTITASKER: 3 books in progress simultaneously
  const inProgressBooks = (user.progress || []).filter(p => p.totalPages > 0 && p.currentPage > 0 && p.currentPage < p.totalPages).length;
  if (inProgressBooks >= 3) {
    awardBadge(user, "MULTITASKER");
  }

  // FINISHED: completed a book (one per book)
  if (safeTotal > 0 && safeCurrent >= safeTotal) {
    awardBadge(user, "FINISHED", volumeId);
  }

  // ── ACTIVITY-BASED BADGES (DAILY_READER, BOOK_MARATHONER, READING_ROUTINE) ──
  // Reuses the existing `readingActivity` array from featureRoutes (streak system).
  // Each entry is { date: "YYYY-MM-DD", minutesRead: 0 }.
  // We log today's date here so updating progress also counts as reading activity.
  user.readingActivity = user.readingActivity || [];
  const todayStr = new Date().toISOString().split("T")[0];
  const alreadyLoggedToday = user.readingActivity.some((entry) => entry.date === todayStr);
  if (!alreadyLoggedToday) {
    user.readingActivity.push({ date: todayStr, minutesRead: 0 });
  }

  // Build a set of dates the user has been active (YYYY-MM-DD format)
  const activeDates = new Set(user.readingActivity.map((a) => a.date));
  const now = new Date();

  // DAILY_READER: logged reading on 3 consecutive days (today + yesterday + day before)
  const yesterdayStr = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const twoDaysAgoStr = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  if (activeDates.has(todayStr) && activeDates.has(yesterdayStr) && activeDates.has(twoDaysAgoStr)) {
    awardBadge(user, "DAILY_READER");
  }

  // BOOK_MARATHONER: active for 7 days straight (each of the last 7 days has activity)
  let sevenDayStreak = true;
  for (let i = 0; i < 7; i++) {
    const dateStr = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (!activeDates.has(dateStr)) {
      sevenDayStreak = false;
      break;
    }
  }
  if (sevenDayStreak) {
    awardBadge(user, "BOOK_MARATHONER");
  }

  // READING_ROUTINE: 10 progress updates within the last 7 days.
  // Tracked on a separate `progressUpdates` array since readingActivity is one entry per day.
  user.progressUpdates = user.progressUpdates || [];
  user.progressUpdates.push(now);
  // Trim to last 14 days so the array doesn't grow forever
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  user.progressUpdates = user.progressUpdates.filter((d) => new Date(d) >= fourteenDaysAgo);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const updatesThisWeek = user.progressUpdates.filter((d) => new Date(d) >= sevenDaysAgo).length;
  if (updatesThisWeek >= 10) {
    awardBadge(user, "READING_ROUTINE");
  }

  await user.save();
  res.json({ message: "Progress updated", progress: user.progress, badges: user.badges, });
});
// logic to get all of the badges accosiated with a user account  
app.get("/api/badges/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ badges: user.badges || [] });
});

app.get("/api/reviews/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ reviews: user.reviews });
  } catch (err) {
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

app.post("/api/reviews/add", async (req, res) => {
  const { email, name, volumeId, rating, reviewText } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingReview = user.reviews.find(r => r.volumeId === volumeId);
    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this book." });
    }

    user.reviews.push({ volumeId, rating, reviewText });

    // conversation starter, be the first user to leave a review on a book 
    const existingBookReview = await Review.findOne({ volumeId });

    if (!existingBookReview) {
      const alreadyHas = (user.badges || []).some(
        (b) => b.type === "CONVERSATION_STARTER" && b.volumeId === volumeId
      );

      if (!alreadyHas) {
        user.badges = user.badges || [];
        user.badges.push({
          type: "CONVERSATION_STARTER",
          volumeId,
          earnedAt: new Date(),
        });
      }
    }

    // critic in the making badge check, if the user has posted 10 reviews or more 
    if ((user.reviews || []).length >= 10) {
      const alreadyHas = (user.badges || []).some(b => b.type === "CRITIC_IN_THE_MAKING");
      if (!alreadyHas) {
        user.badges = user.badges || [];
        user.badges.push({ type: "CRITIC_IN_THE_MAKING", earnedAt: new Date() });
      }
    }

    await user.save();

    const review = new Review({ email, name, volumeId, rating, reviewText });
    await review.save();
    res.json({ message: "Review added", review });
  } catch (err) {
    res.status(500).json({ error: "Failed to add review" });
  }
});

// Delete a review
app.post("/api/reviews/delete", async (req, res) => {
  const { email, volumeId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userReview = user.reviews.find(r => r.volumeId === volumeId);
    if (!userReview) return res.status(404).json({ error: "Review not found for this user" });

    user.reviews.pull(userReview._id);
    await user.save();

    await Review.findOneAndDelete({ email, volumeId });

    res.json({ message: "Review deleted successfully", reviews: user.reviews });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// Edit a review
app.post("/api/reviews/edit", async (req, res) => {
  const { email, volumeId, rating, reviewText } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userReview = user.reviews.find(r => r.volumeId === volumeId);
    if (!userReview) return res.status(404).json({ error: "Review not found for this user" });

    userReview.rating = rating;
    userReview.reviewText = reviewText;
    userReview.updatedOn = Date.now();
    await user.save();

    await Review.findOneAndUpdate(
      { email, volumeId },
      { rating, reviewText, updatedOn: Date.now() }
    );

    res.json({ message: "Review updated successfully", reviews: user.reviews });
  } catch (err) {
    console.error("Edit review error:", err);
    res.status(500).json({ error: "Failed to edit review" });
  }
});

app.get("/api/reviews/book/:volumeId", async (req, res) => {
  try {
    const reviews = await Review.find({ volumeId: req.params.volumeId }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: "Failed to get reviews" });
  }
});


// Get all users (excluding current user)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email name createdAt').sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Search users by name or email
app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }, 'email name createdAt').limit(20);
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});
// Send a friend request
app.post('/api/friends/request', async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.body;
    
    // Validation
    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({ error: 'Sender and receiver emails are required' });
    }
    
    if (senderEmail === receiverEmail) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }
    
    // Check if users exist
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });
    
    if (!sender || !receiver) {
      return res.status(404).json({ error: 'One or both users not found' });
    }
    
    // Check if already friends
    if (sender.friends.includes(receiverEmail)) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }
    
    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { senderEmail, receiverEmail, status: 'pending' },
        { senderEmail: receiverEmail, receiverEmail: senderEmail, status: 'pending' }
      ]
    });
    
    if (existingRequest) {
      // Check who sent the existing request
      if (existingRequest.senderEmail === senderEmail) {
        // User already sent a request to this person
        return res.status(400).json({ error: 'Request already sent' });
      } else {
        // The other person sent them a request (they should accept it instead)
        return res.status(400).json({ error: 'This user already sent you a friend request. Check your pending requests!' });
      }
    }
    
    // Create friend request
    const friendRequest = new FriendRequest({
      senderEmail,
      receiverEmail,
      status: 'pending',
    });
    
    await friendRequest.save();
    
    res.status(201).json({ 
      message: 'Friend request sent successfully', 
      request: friendRequest 
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Get pending friend requests (received)
app.get('/api/friends/requests/pending/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const requests = await FriendRequest.find({
      receiverEmail: email,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    // Populate sender information
    const requestsWithSenderInfo = await Promise.all(
      requests.map(async (request) => {
        const sender = await User.findOne({ email: request.senderEmail }, 'name email');
        return {
          ...request.toObject(),
          senderInfo: sender
        };
      })
    );
    
    res.status(200).json(requestsWithSenderInfo);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// Get sent friend requests
app.get('/api/friends/requests/sent/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const requests = await FriendRequest.find({
      senderEmail: email,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    // Populate receiver information
    const requestsWithReceiverInfo = await Promise.all(
      requests.map(async (request) => {
        const receiver = await User.findOne({ email: request.receiverEmail }, 'name email');
        return {
          ...request.toObject(),
          receiverInfo: receiver
        };
      })
    );
    
    res.status(200).json(requestsWithReceiverInfo);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
});

// Accept friend request
app.post('/api/friends/request/accept', async (req, res) => {
  try {
    const { requestId, userEmail } = req.body;
    
    const request = await FriendRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    if (request.receiverEmail !== userEmail) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is no longer pending' });
    }
    
    // Update request status
    request.status = 'accepted';
    request.updatedAt = new Date();
    await request.save();
    
    // Add each user to the other's friends list
    await User.updateOne(
      { email: request.senderEmail },
      { $addToSet: { friends: request.receiverEmail } }
    );
    
    await User.updateOne(
      { email: request.receiverEmail },
      { $addToSet: { friends: request.senderEmail } }
    );
    // get the receiver and sender emails, this way the badge can be added for both parties 
    const sender = await User.findOne({ email: request.senderEmail });
    const receiver = await User.findOne({ email: request.receiverEmail });
    if (!sender || !receiver) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // FIRST_CONNECTION badge for sender
    if ((sender.friends || []).length >= 1) {
      const senderHasBadge = (sender.badges || []).some(
        (b) => b.type === 'FIRST_CONNECTION'
      );

      if (!senderHasBadge) {
        sender.badges = sender.badges || [];
        sender.badges.push({
          type: 'FIRST_CONNECTION',
          earnedAt: new Date(),
        });
      }
    }

    // FIRST_CONNECTION badge for receiver
    if ((receiver.friends || []).length >= 1) {
      const receiverHasBadge = (receiver.badges || []).some(
        (b) => b.type === 'FIRST_CONNECTION'
      );

      if (!receiverHasBadge) {
        receiver.badges = receiver.badges || [];
        receiver.badges.push({
          type: 'FIRST_CONNECTION',
          earnedAt: new Date(),
        });
      }
    }

    await sender.save();
    await receiver.save();

    res.status(200).json({ 
      message: 'Friend request accepted', 
      request 
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Reject/Cancel friend request
app.post('/api/friends/request/reject', async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const request = await FriendRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    request.status = 'rejected';
    request.updatedAt = new Date();
    await request.save();
    
    res.status(200).json({ 
      message: 'Friend request rejected', 
      request 
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Failed to reject friend request' });
  }
});

// Get user's friends list
app.get('/api/friends/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get detailed info for each friend
    const friends = await User.find(
      { email: { $in: user.friends } },
      'email name createdAt'
    );
    
    res.status(200).json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Remove a friend
app.post('/api/friends/remove', async (req, res) => {
  try {
    const { userEmail, friendEmail } = req.body;
    
    // Remove from both users' friends lists
    await User.updateOne(
      { email: userEmail },
      { $pull: { friends: friendEmail } }
    );
    
    await User.updateOne(
      { email: friendEmail },
      { $pull: { friends: userEmail } }
    );
    
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// Check friendship status
app.get('/api/friends/status', async (req, res) => {
  try {
    const { userEmail, otherUserEmail } = req.query;
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if they're friends
    if (user.friends.includes(otherUserEmail)) {
      return res.status(200).json({ status: 'friends' });
    }
    
    // Check for pending request
    const pendingRequest = await FriendRequest.findOne({
      $or: [
        { senderEmail: userEmail, receiverEmail: otherUserEmail, status: 'pending' },
        { senderEmail: otherUserEmail, receiverEmail: userEmail, status: 'pending' }
      ]
    });
    
    if (pendingRequest) {
      if (pendingRequest.senderEmail === userEmail) {
        return res.status(200).json({ status: 'request_sent', requestId: pendingRequest._id });
      } else {
        return res.status(200).json({ status: 'request_received', requestId: pendingRequest._id });
      }
    }
    
    res.status(200).json({ status: 'none' });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ error: 'Failed to check friendship status' });
  }
});

app.post("/api/messages/send", async (req, res) => {
  try {
    const { senderEmail, receiverEmail, volumeId, title } = req.body;

    if (!senderEmail || !receiverEmail || !volumeId || !title) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const newMessage = new Message({
      sender: senderEmail,
      receiver: receiverEmail,
      volumeId,
      title,
      messageText: `Hi! I think you should give this book a try: ${title}`,
      unread: "unread",
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.get("/api/messages/:email", async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.params.email })
      .sort({ sentAt: -1 });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/api/messages/read", async (req, res) => {
  try {
    const { email, senderEmail } = req.body;

    const query = { receiver: email, unread: "unread" };
    if (senderEmail) query.sender = senderEmail;

    await Message.updateMany(query, { unread: "read" });

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update messages" });
  }
});

// Update user name
app.post('/api/users/update-name', async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) return res.status(400).json({ error: "Email and name required" });
  try {
    const user = await User.findOneAndUpdate({ email }, { name }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Name updated", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update name" });
  }
});

// Change password
app.post("/api/users/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Email, old password, and new password required" });
  }

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: oldPassword,
  });

  user.authenticateUser(authDetails, {
    onSuccess: () => {
      user.changePassword(oldPassword, newPassword, (err, result) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.json({ message: "Password changed successfully" });
      });
    },
    onFailure: (err) => {
      res.status(401).json({ error: err.message || "Authentication failed" });
    },
  });
});
// ============ TRENDING BOOKS ROUTE ============

// Simple in-memory cache for trending (refreshes every 5 minutes)
let trendingCache = null;
let trendingCacheTime = 0;
const TRENDING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get trending books (most-added to bookshelves across all users)
app.get("/api/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const now = Date.now();

    // Return cached result if still fresh
    if (trendingCache && (now - trendingCacheTime) < TRENDING_CACHE_TTL) {
      return res.json({ trending: trendingCache.slice(0, limit) });
    }

    // Aggregate: unwind all users' bookshelves, count occurrences of each volumeId
    const trending = await User.aggregate([
      { $unwind: "$bookshelf" },
      { $group: { _id: "$bookshelf", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const results = trending.map((item) => ({
      volumeId: item._id,
      readers: item.count,
    }));

    // Update cache
    trendingCache = results;
    trendingCacheTime = now;

    res.json({ trending: results.slice(0, limit) });
  } catch (err) {
    console.error("Error fetching trending books:", err);
    res.status(500).json({ error: "Failed to fetch trending books" });
  }
});


// Start server (single listen)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});


const BADGE_POINTS = {
  NEW_CHAPTER: 10,
  HALFWAY: 10,
  FINISHED: 25,
  FUTURE_LIBRARIAN: 30,
  CRITIC_IN_THE_MAKING: 20,
  FIRST_CONNECTION: 10,
  CONVERSATION_STARTER: 15,
  BOOK_MARATHONER: 20,
  GENRE_JUMPER: 20,
  NEWCOMER: 10,
  BOOKWORM_BEGINNER: 15,
  LIBRARY_LEGEND: 100,
  READING_ROUTINE: 30,
  DAILY_READER: 15,
  DEEP_DIVER: 20,
  MULTITASKER: 30,
  EXPLORER: 30,
};

app.get("/api/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const users = await User.find({}, { name: 1, email: 1, badges: 1, createdAt: 1 }).lean();

    const leaderboard = users
      .map((u) => {
        const badges = u.badges || [];
        const score = badges.reduce((sum, b) => sum + (BADGE_POINTS[b.type] || 0), 0);

        return {
          name: u.name,
          email: u.email,
          score,
          badgeCount: badges.length,
          badgeBreakdown: badges.reduce((acc, b) => {
            acc[b.type] = (acc[b.type] || 0) + 1;
            return acc;
          }, {}),
        };
      })
      // sort by score then badgeCount
      .sort((a, b) => b.score - a.score || b.badgeCount - a.badgeCount || a.name.localeCompare(b.name))
      .slice(0, limit);

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

app.post("/api/users/self-delete", async (req, res) => {
  const { email, accessToken } = req.body;
  if (!email || !accessToken) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (!cognitoRegion) {
    return res.status(500).json({ error: "Cognito region is not configured" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1) Verify token identity against Cognito
    const me = await callCognitoUserApi(
      "AWSCognitoIdentityProviderService.GetUser",
      { AccessToken: accessToken }
    );

    const attrs = me?.UserAttributes || [];
    const emailAttr = attrs.find((a) => a.Name === "email")?.Value?.toLowerCase();

    if (!emailAttr || emailAttr !== normalizedEmail) {
      return res.status(401).json({ error: "Invalid token for this user" });
    }

    // 2) Delete Cognito user (self-delete)
    await callCognitoUserApi(
      "AWSCognitoIdentityProviderService.DeleteUser",
      { AccessToken: accessToken }
    );

    // 3) Delete Mongo user
    await User.deleteOne({ email: normalizedEmail });

    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Self-delete error:", err.message);
    return res.status(err.status === 400 || err.status === 401 ? 401 : 500).json({
      error: "Failed to delete account",
      details: err.message,
    });
  }
});

// Helper: call Cognito User Pool API with access token (no admin creds required)
const cognitoRegion =
  process.env.COGNITO_REGION ||
  process.env.AWS_REGION ||
  (poolData.UserPoolId ? poolData.UserPoolId.split("_")[0] : "");

const cognitoEndpoint = `https://cognito-idp.${cognitoRegion}.amazonaws.com/`;

async function callCognitoUserApi(target, payload) {
  const resp = await fetch(cognitoEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": target,
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.message || data?.__type || "Cognito request failed";
    const err = new Error(msg);
    err.status = resp.status;
    throw err;
  }
  return data;
}