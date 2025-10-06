import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import User from "./models/User.js";
import booksRoute from "./routes/bookSearch.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI /*, { useNewUrlParser: true, useUnifiedTopology: true }*/ )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Cognito Configuration
const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
  ClientId: process.env.COGNITO_APP_CLIENT_ID,
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
      const newUser = new User({ name, email });
      await newUser.save();
      res.json({
        message: "Sign-up successful and user added to database",
        user: result.user,
      });
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

      let userInfo = null;
      try {
        userInfo = await User.findOne({ email });
      } catch (dbError) {
        console.error("Error retrieving user from database:", dbError);
      }

      res.json({
        message: "Login successful",
        token: accessToken,
        user: userInfo, // can be null if not found
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

// Other routes
app.use("/api", booksRoute);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Catch-all API 404
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
