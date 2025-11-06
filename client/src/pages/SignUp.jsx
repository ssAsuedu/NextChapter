import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, confirmEmail } from "../api";
import { TextField, Button } from "@mui/material";
import "../styles/LoginPage/SignUp.css";
import signUp from "../assets/sign_up.svg";
import confirmationImage from "../assets/confirmation_page.svg";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({name: "", email: "", password: []});
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({name: "", email: "", password: []});

    let hasError = false;
    const newErrors = {name: "", email: "", password: []};
    const specialSymbols = "!@#$%^&*";

    if(!name.trim()) {
      newErrors.name = "Name cannot be empty.";
    }
    if(!email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }

    //password errors
    const passwordErrors = [];
    if(!password.trim()) {
      passwordErrors.push("Password cannot be empty.");
    }
    if(password.length < 8) {
      passwordErrors.push("Password must be at least 8 characters long.");
    }
    
    if(!/[A-Z]/.test(password)) {
      passwordErrors.push("Password must include at least one uppercase letter.");
    }
    if(!/[0-9]/.test(password)) {
      passwordErrors.push("Password must include at least one number");
    }
    if (!specialSymbols.split("").some(symbol => password.includes(symbol))) {
      passwordErrors.push("Password must include at least one special symbol (!@#$%^&*).");
    }

    if(passwordErrors.length > 0) {
      newErrors.password = passwordErrors;
      hasError = true;
    }

    if(hasError) {
      setErrors(newErrors);

      if(newErrors.password) {
      setPassword("");
    }
      return;
    }

    setLoading(true);
    try {
      await signup({ email, password, name });
      setShowConfirm(true);
    } catch (err) {
      
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
      {/* Left Half with Sign-Up Form */}
      <div className="signup-form">
        <div className="signup-form-content">
          {!showConfirm && <img src={signUp} className="signup-svg"></img>}
          {!showConfirm && <h1>Create an Account</h1>}
          {!showConfirm ? (
          <>
            <form onSubmit={handleSignUp} noValidate>
              <div>
                <TextField
                  label="Name"
                  variant="outlined"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  margin="normal"
                  error = {!!errors.name}
                  helperText = {errors.name}
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
            //autofill textfield/text color
            "& input:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px white inset !important",
            WebkitTextFillColor: "#2D1B3D",
            caretColor: "#2D1B3D",
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
          //border when hovered
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderWidth: "2px",
              borderColor: "#6B3F69",
            },
            "& input:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px white inset !important",
            WebkitTextFillColor: "#2D1B3D",
            caretColor: "#2D1B3D",
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
              error={errors.password.length > 0}
              helperText={ //checks if the password array for errors exists
                errors.password.length > 0 ? (
                <span className="password-error-list"> {/* adds the style for the errors */}
                  {errors.password.map((err, index) => (
                  <span key={index} style={{ display: "block" }}>{err}</span>
                  ))}
                </span>
                ) : ""
              }
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
              style={{ marginTop: "20px" }}
              disabled={loading}
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
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </>
        ) : (
          <>
          
            <h1>Confirm Your Email</h1>
            <img src={confirmationImage} className="confirmation-svg"></img>
            <form onSubmit={handleConfirm} noValidate>
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
                disabled={loading}
              >
                {loading ? "Confirming..." : "Confirm Email"}
              </Button>
            </form>
          </>
        )}
        <p className="login">Have an account already? <a href="/login">Login</a></p>
      </div>
      </div>
      {/* Right Half with image */}
      <div className="signup-image"></div>
    </div>
  );
};

export default SignUp;