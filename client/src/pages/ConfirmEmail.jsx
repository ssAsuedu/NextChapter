import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {confirmEmail, resendConfirmationCode } from "../api";
import confirmationImage from "../assets/confirmation.svg";
import { TextField, Button } from "@mui/material";
import "../styles/LoginPage/ConfirmEmail.css";
import confirmCheck from "../assets/confirm_success.svg";

const ConfirmEmail = () => {
    const location = useLocation();
    const [confirmCode, setConfirmCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successModal, setSuccessModal] = useState(false);
    const [resending, setResending] = useState(false);

    const [resultMessage, setResultMessage] = useState();
    const [coolDown, setCoolDown] = useState(0);

    const email = location.state?.email || "";
    const navigate = useNavigate();

    const handleConfirm = async (e) => {
        e.preventDefault();
            setLoading(true);
            try {
              const response = await confirmEmail({ email, code: confirmCode });
              if(response.data.message) {
                setSuccessModal(true);
              }
              
            } catch (err) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                confirm: "Invalid confirmation code",
              }));
            }
            setLoading(false);
    };

    const handleResendCode = async () => {
      if (coolDown > 0) return ;

      setResending(true);
      try {
        const response = await resendConfirmationCode({ email });
        setResultMessage(response.data.message);

        setCoolDown(30);
        const interval = setInterval(() => {
          setCoolDown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setTimeout(() => {
          setResultMessage("");

        }, 8000);
      }
      catch (err) {
        console.error(err);
      }
      setResending(false);
    }

    return (
        <div className="signup-page">
          {successModal && (
            <div className="modal-wrapper">
              <div className="success-modal">
                <div className="checkmark">
                    <img src={confirmCheck}></img>
                  </div>
                  <div className="bottom-half">
                      <h2>Success!</h2>
                      <p>Your email has been confirmed.</p>
                      <Button className="modal-login" onClick={() => navigate("/login")}>Go to Login</Button>
                  </div>
                </div>
              </div>
          )}
          <div className="signup-form">
              <h1>Confirm Your Email</h1>
              {resultMessage && (
                <div className="handle-message">
                <p>{resultMessage}</p>
                </div>
              )}
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
                  onChange={(e) => {
                    setConfirmCode(e.target.value);
                    if(errors) {
                      setErrors("");
                    }
                  }}
                  error = {!!errors.confirm}
                  helperText={errors.confirm}
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
            <Button className="resend-btn"
            onClick={handleResendCode}
            disabled={resending || coolDown > 0}
            >
              {coolDown > 0 ? `Wait ${coolDown}s` : resending ? "Resending..." : "Resend Code"}</Button>
            </div>
            <div className="signup-image"></div>
        </div>
    );
}

export default ConfirmEmail;