import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import "../styles/LoginPage/Login.css";
import { TextField, Button } from "@mui/material";
import readingBook from "../assets/login_right.svg";
import readingLeft from "../assets/login_left.svg";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({email: "", password: ""});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({email: "", password: ""});
    
    let hasError = false;
    const newErrors = {email: "", password: ""};

    if(!email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }
    if(!password.trim()) {
      newErrors.password = "Password cannot be empty.";
      hasError = true;
    }
    if(hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await login({ email, password });
      localStorage.setItem("token", response.data.token);
      if (response.data.user?.name) {
        localStorage.setItem("userName", response.data.user.name);
      }
      localStorage.setItem("userEmail", response.data.user.email);

      navigate("/profile");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Email and password do not match.";
        setErrors(prev => ({...prev, password: errorMessage}));
      
      // alert("Login failed: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div className="login-page">
      {/* Left Half with Login Form */}
      <div className="login-form">
        <div className="login-form-content">
          <img src={readingLeft} alt="Girl sitting while reading a book with a stack of 3 books next to her." className="login-left"></img>
          <img src={readingBook} alt="Girl reading a black book." className="login-svg"></img>
          <h1>Welcome Back!</h1>
        <form onSubmit={handleLogin} noValidate>
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
              placeholder="e.g. johndoe123@gmail.com" //Placholder text inside the email to let users know the format
              error = {!!errors.email}
              helperText = {errors.email}
              slotProps={{
                root: {
                  className: 'form-textfield-root',
                },
                inputLabel: {
                  className: 'form-textfield-label',
                },
                input: {
                   className:'form-textfield-input',
                },
              }}
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
              error = {!!errors.password}
              helperText = {errors.password}
              slotProps={{
                root: {
                  className: 'form-textfield-root',
                },
                inputLabel: {
                  className: 'form-textfield-label',
                },
                input: {
                  className:'form-textfield-input',
                },
              }}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="login"
          >
            Login
          </Button>
        </form>
        <p className="account-creation">Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>

      {/* Right Half with Background Image */}
      <div className="login-image" alt="Person sitting at a desk reading a book with a cup of coffee, lamp, and bookshelf filled with books in the background."></div>
    </div>
  );
};

export default Login;