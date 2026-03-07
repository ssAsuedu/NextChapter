import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {confirmEmail } from "../api";
import confirmationImage from "../assets/confirmation.svg";
import { TextField, Button } from "@mui/material";

const ConfirmEmail = () => {
    const location = useLocation();
    const [confirmCode, setConfirmCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const email = location.state?.email || "";
    
    const handleConfirm = async (e) => {
        e.preventDefault();
            setLoading(true);
            try {
              const response = await confirmEmail({ email, code: confirmCode });
              // alert(response.data.message);
              navigate("/login");
            } catch (err) {
              // alert("Confirmation failed: " + (err.response?.data?.error || "Unknown error"));
              setErrors((prevErrors) => ({
                ...prevErrors,
                confirm: "Invalid confirmation code",
              }));
            }
            setLoading(false);
    };

    return (
        <div className="signup-page">
            <div className="signup-form">
              <h1>Confirm Your Email</h1>
            <img src={confirmationImage} alt = "Girl holding a phone with a checkmark icon indicating email confirmation." className="confirmation-svg"></img>
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
                  label="Confirmation Code"
                  variant="outlined"
                  fullWidth
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                //   error = {!!errors.confirm}
                //   helperText={errors.confirm}
                  required
                  margin="normal"
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
                className = "signup"
                disabled={loading}
              >
                {loading ? "Confirming..." : "Confirm Email"}
              </Button>
            </form>
            </div>
            <div className="signup-image"></div>
        </div>
    );
}

export default ConfirmEmail;