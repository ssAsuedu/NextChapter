import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, confirmEmail } from "../api";
import { TextField, Button } from "@mui/material";
import "../styles/LoginPage/SignUp.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({ email, password, name });
      setShowConfirm(true);
    } catch (err) {
      alert("Sign-up failed: " + (err.response?.data?.error || "Unknown error"));
    }
    setLoading(false);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await confirmEmail({ email, code: confirmCode });
      alert(response.data.message);
      navigate("/login");
    } catch (err) {
      alert("Confirmation failed: " + (err.response?.data?.error || "Unknown error"));
    }
    setLoading(false);
  };

  return (
    <div className="signup-page">
      {/* Left Half with Background Image */}
      <div className="signup-image"></div>

      {/* Right Half with Sign-Up Form */}
      <div className="signup-form">
        {!showConfirm ? (
          <>
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
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1>Confirm Your Email</h1>
            <form onSubmit={handleConfirm}>
              <div>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  disabled
                  margin="normal"
                />
              </div>
              <div>
                <TextField
                  label="Confirmation Code"
                  variant="outlined"
                  fullWidth
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
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
                disabled={loading}
              >
                {loading ? "Confirming..." : "Confirm Email"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUp;