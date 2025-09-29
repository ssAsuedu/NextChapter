import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LoginPage/SignUp.css";
import { TextField, Button } from "@mui/material";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5050/api/signup", {
        email,
        password,
        name,
      });
      alert("Sign-up successful! Please log in.");
      navigate("/login"); // Redirect to login page after successful sign-up
    } catch (err) {
      alert("Sign-up failed: " + err.response.data.error);
    }
  };

  return (
    <div className="signup-page">
      {/* Left Half with Background Image */}
      <div className="signup-image"></div>

      {/* Right Half with Sign-Up Form */}
      <div className="signup-form">
        <h1>Sign Up</h1>
        <form onSubmit={handleSignUp}>
          <div>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              margin="normal"
            />
          </div>
          <div>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
            />
          </div>
          <div>
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: "20px" }}
          >
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;