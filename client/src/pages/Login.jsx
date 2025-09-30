import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import "../styles/LoginPage/Login.css";
import { TextField, Button } from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      localStorage.setItem("token", response.data.token);
      if (response.data.user?.name) {
        localStorage.setItem("userName", response.data.user.name);
      }
     
      navigate("/profile");
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div className="login-page">
      {/* Left Half with Login Form */}
      <div className="login-form">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
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
            Login
          </Button>
        </form>
      </div>

      {/* Right Half with Background Image */}
      <div className="login-image"></div>
    </div>
  );
};

export default Login;