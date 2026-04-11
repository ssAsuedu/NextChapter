import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, confirmEmail } from "../api";
import { TextField, Button } from "@mui/material";
import "../styles/LoginPage/SignUp.css";
import signUp from "../assets/sign_up.svg";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: [],
    email: "",
    password: [],
    confirm: "",
  });
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({ name: [], email: "", password: [] });

    let hasError = false;
    const newErrors = { name: [], email: "", password: [] };
    const usernameErrors = [];
    const specialSymbols = "!@#$%^&*";

    if (!name.trim()) {
      usernameErrors.push("Name cannot be empty.");
    }

    if (name.length > 15) {
      usernameErrors.push("Name must be 15 characters or less.");
      hasError = true;
    }

    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }

    //password errors
    const passwordErrors = [];
    if (!password.trim()) {
      passwordErrors.push("Password cannot be empty.");
    }
    if (password.length < 8) {
      passwordErrors.push("Password must be at least 8 characters long.");
    }

    if (!/[A-Z]/.test(password)) {
      passwordErrors.push(
        "Password must include at least one uppercase letter.",
      );
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push("Password must include at least one number");
    }
    if (!specialSymbols.split("").some((symbol) => password.includes(symbol))) {
      passwordErrors.push(
        "Password must include at least one special symbol (!@#$%^&*).",
      );
    }

    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors;
      hasError = true;
    }

    if (usernameErrors.length > 0) {
      newErrors.name = usernameErrors;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);

      return;
    }

    setLoading(true);
    try {
      await signup({ email, password, name });
      navigate("/confirm", { state: { email } });
    } catch (err) {
      if (err.response?.data?.error === "UsernameExistsException") {
        setErrors((prev) => ({
          ...prev,
          email: "An account with this email already exists.",
        }));
      } else if (err.response?.data?.error === "ValidationError") {
        setErrors((prev) => ({
          ...prev,
          name: err.response?.data?.message,
        }));
      }
    }
    setLoading(false);
  };

  return (
    <div className="signup-page">
      {/* Left Half with Sign-Up Form */}
      <div className="signup-form">
        <div className="signup-form-content">
          <img
            src={signUp}
            alt="Picture of a form with two textfields and submit button."
            className="signup-svg"
          ></img>
          <h1>Create an Account</h1>
          <form onSubmit={handleSignUp} noValidate>
            <div>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors?.name.length > 0) {
                    setErrors((prev) => ({
                      ...prev,
                      name: [],
                    }));
                  }
                }}
                required
                margin="normal"
                error={errors?.name.length > 0}
                helperText={
                  errors?.name.length > 0 ? (
                    <span className="password-error-list">
                      {" "}
                      {/* adds the style for the errors */}
                      {errors.name.map((err, index) => (
                        <span key={index} style={{ display: "block" }}>
                          {err}
                        </span>
                      ))}
                    </span>
                  ) : (
                    ""
                  )
                }
                slotProps={{
                  root: {
                    className: "form-textfield-root",
                  },
                  inputLabel: {
                    className: "form-textfield-label",
                  },
                  input: {
                    className: "form-textfield-input",
                  },
                }}
              />
            </div>
            <div>
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors?.email.length > 0) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "",
                    }));
                  }
                }}
                required
                margin="normal"
                placeholder="e.g. johndoe123@gmail.com" //Placholder text inside the email to let users know the format
                error={!!errors.email}
                helperText={errors.email}
                slotProps={{
                  root: {
                    className: "form-textfield-root",
                  },
                  inputLabel: {
                    className: "form-textfield-label",
                  },
                  input: {
                    className: "form-textfield-input",
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors?.password.length > 0) {
                    setErrors((prev) => ({
                      ...prev,
                      password: [],
                    }));
                  }
                }}
                required
                margin="normal"
                error={errors?.password.length > 0}
                helperText={
                  //checks if the password array for errors exists
                  errors?.password.length > 0 ? (
                    <span className="password-error-list">
                      {" "}
                      {/* adds the style for the errors */}
                      {errors.password.map((err, index) => (
                        <span key={index} style={{ display: "block" }}>
                          {err}
                        </span>
                      ))}
                    </span>
                  ) : (
                    ""
                  )
                }
                slotProps={{
                  root: {
                    className: "form-textfield-root",
                  },
                  inputLabel: {
                    className: "form-textfield-label",
                  },
                  input: {
                    className: "form-textfield-input",
                  },
                }}
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: "20px" }}
              disabled={loading}
              className="signup"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
          <p className="login-redirect">
            Already have an account?<a href="/login"> Login now</a>
          </p>
        </div>
      </div>
      {/* Right Half with image */}
      <div className="signup-image"></div>
    </div>
  );
};

export default SignUp;
