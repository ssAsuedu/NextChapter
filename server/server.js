import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from "amazon-cognito-identity-js";
import User from "./models/User.js"; // Import the User model

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Cognito Configuration
const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID, // Replace with your User Pool ID
  ClientId: process.env.COGNITO_APP_CLIENT_ID,  // Replace with your App Client ID
};
const userPool = new CognitoUserPool(poolData);

// Sign-Up Route
app.post("/api/signup", (req, res) => {
  const { email, password, name } = req.body;

  const attributeList = [
    new CognitoUserAttribute({ Name: "email", Value: email }),
    new CognitoUserAttribute({ Name: "name", Value: name }),
  ];

  userPool.signUp(email, password, attributeList, null, async (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Add the user to MongoDB
      const newUser = new User({ name, email });
      await newUser.save();

      res.json({ message: "Sign-up successful and user added to database", user: result.user });
    } catch (dbError) {
      console.error("Error saving user to database:", dbError);
      res.status(500).json({ error: "Failed to save user to database" });
    }
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

      // Optional: Fetch user info from MongoDB
      let userInfo = null;
      try {
        userInfo = await User.findOne({ email });
      } catch (dbError) {
        console.error("Error retrieving user from database:", dbError);
      }

      res.json({
        message: "Login successful",
        token: accessToken,
        user: userInfo, // This can be null if not found
      });
    },
    onFailure: (err) => {
      console.error("Login error:", err);
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
      await user.save();
    }
    res.json({ message: "Book added to bookshelf", bookshelf: user.bookshelf });
  } catch (err) {
    res.status(500).json({ error: "Failed to add book" });
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

  const idx = user.progress.findIndex((p) => p.volumeId === volumeId);
  if (idx > -1) {
    user.progress[idx].currentPage = currentPage;
    user.progress[idx].totalPages = totalPages;
  } else {
    user.progress.push({ volumeId, currentPage, totalPages });
  }
  await user.save();
  res.json({ message: "Progress updated", progress: user.progress });
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
  const { email, volumeId, rating, reviewText } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.reviews.push({ volumeId, rating, reviewText });
    await user.save();

    res.json({ message: "Review added", reviews: user.reviews });
  } catch (err) {
    res.status(500).json({ error: "Failed to add review" });
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});