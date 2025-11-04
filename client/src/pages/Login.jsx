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
          <img src={readingLeft} className="login-left"></img>
          <img src={readingBook} alt="Leaf Icon" className="login-svg"></img>
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
              inputLabel: {
                sx: {
                //font and size for label
                  fontFamily: "'Crimson Text', serif",
                  fontSize: "18px",

              // asterisk color
              "& .MuiFormLabel-asterisk": {
                color: "red",
                },

              // when the field is clicked
              "&.Mui-focused": {
                color: "#2D1B3D",
                fontWeight: 600,
              },
            },
          },

          // style of the actual text inside field
          input: {
            sx: {
              color: "#2D1B3D",
              fontFamily: "'Crimson Text', serif",
              fontSize: "16px",
              "&::placeholder": {
                color: "#666666",
                opacity: 1,
              },
            },
          },
        }}
        sx={{
          //autofill textfield/text color
          "& input:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px white inset !important",
            WebkitTextFillColor: "#2D1B3D",
            caretColor: "#2D1B3D",
          },
          //border when hovered
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderWidth: "2px",
            borderColor: "#6B3F69",
          },

          //border when clicked
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: "2px",
            borderColor: "#6B3F69",
            },

            //change focus blue to dark purple
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#2D1B3D",
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
              inputLabel: {
                sx: {
                //font and size for label
                  fontFamily: "'Crimson Text', serif",
                  fontSize: "18px",

              // asterisk color
              "& .MuiFormLabel-asterisk": {
                color: "red",
                },

              // when the field is clicked
              "&.Mui-focused": {
                color: "#2D1B3D",
                fontWeight: 600,
              },
            },
          },

          // style of the actual text inside field
          input: {
            sx: {
              color: "#2D1B3D",
              fontFamily: "'Crimson Text', serif",
              fontSize: "16px",
              "&::placeholder": {
                color: "#666666",
                opacity: 1,
              },
            },
          },
        }}
        sx={{
        //border when hovered
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderWidth: "2px",
            borderColor: "#6B3F69",
          },

          //border when clicked
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: "2px",
            borderColor: "#6B3F69",
            },

            //change focus blue to dark purple
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#2D1B3D",
            },
          }}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ // Custom styles for the button
              marginTop: "20px",
              backgroundColor: "#6B3F69",
              borderRadius: "10px",
              fontFamily: "'Crimson Text', serif",
              fontSize: "16px",
              fontWeight: "600",
              padding: "10px",
              "&:hover": {
                backgroundColor: "#5a3358",
              },
            }}
          >
            Login
          </Button>
        </form>
        <p className="account-creation">Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>

      {/* Right Half with Background Image */}
      <div className="login-image"></div>
    </div>
  );
};

export default Login;