import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import dotenv from "dotenv";

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
    {
      Name: "email",
      Value: email,
    },
    {
      Name: "name",
      Value: name,
    },
  ];

  userPool.signUp(email, password, attributeList, null, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "Sign-up successful", user: result.user });
  });
});

// Login Route
app.post("/api/login", (req, res) => {
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
    onSuccess: (result) => {
      const accessToken = result.getAccessToken().getJwtToken();
      res.json({ message: "Login successful", token: accessToken });
    },
    onFailure: (err) => {
      console.error("Login error:", err); // Log the error for debugging
      res.status(401).json({ error: err.message || "Login failed" });
    },
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});