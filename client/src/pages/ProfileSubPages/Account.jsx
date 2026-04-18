import React, { useEffect, useState } from "react";
import "../../styles/ProfilePage/Account.css";
import profileImage from "../../assets/profile2.svg";
import ProfileNavbar from "../../components/ProfilePage/ProfileNavbar";
import {
  getAllUsers,
  getFriends,
  updateUserName,
  changePassword,
  selfDeleteAccount,
} from "../../api";
import { TextField } from "@mui/material";
import ThemeToggle from "../../components/LandingPage/ThemeToggle";

const Account = () => {
  const email = localStorage.getItem("userEmail");
  const [user, setUser] = useState(null);
  const [friendCount, setFriendCount] = useState(0);
  const [usernameUpdated, setUsernameUpdated] = useState("");
  const [newName, setNewName] = useState("");
  const [userNameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [nameErrors, setNameErrors] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Pure validation function - just returns errors, no side effects
  const validatePassword = (oldPassword, newPassword, confirmPassword) => {
    const errors = {};
    const specialSymbols = "!@#$%^&*";

    if (!oldPassword || !newPassword || !confirmPassword) {
      errors.fields = "All fields are required.";
      return errors; // short-circuit: no point checking other rules if fields are empty
    }

    if (newPassword !== confirmPassword) {
      errors.newPass = "New passwords do not match.";
    }
    if (newPassword.length < 8) {
      errors.length = "Password must be at least 8 characters.";
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.uppercase = "Password must include at least one uppercase letter.";
    }
    if (!/[0-9]/.test(newPassword)) {
      errors.number = "Password must include at least one number.";
    }
    if (
      !specialSymbols.split("").some((symbol) => newPassword.includes(symbol))
    ) {
      errors.special =
        "Password must include at least one special character !@#$%^&*.";
    }

    return errors;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;
      try {
        const usersRes = await getAllUsers();
        const foundUser = usersRes.data.find((u) => u.email === email);
        setUser(foundUser);
        setNewName(foundUser?.name || "");
        const friendsRes = await getFriends(email);
        setFriendCount(
          Array.isArray(friendsRes.data) ? friendsRes.data.length : 0,
        );
      } catch (err) {
        setUser(null);
        setFriendCount(0);
      }
    };
    fetchUserData();
  }, [email]);

  const handleNameChange = async () => {
    if (!newName.trim()) {
      setNameErrors("Please enter a name.");
      return;
    }

    if (newName.trim() === user.name) {
      setNameErrors("Please enter a new name.");
      return;
    }
    try {
      setUsernameLoading(true);
      setNameErrors("");
      await updateUserName({ email: user.email, name: newName.trim() });
      setUser({ ...user, name: newName.trim() });
      localStorage.setItem("userName", newName.trim());
      setUsernameUpdated("Username successfully updated.");
    } catch (err) {
      setNameErrors(err.response?.data?.error || "Failed to update name.");
    }
    setTimeout(() => {
      setUsernameUpdated("");
    }, 3000);
    setUsernameLoading(false);
  };

  // Password change handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError({});
    setPasswordSuccess("");

    // Validate FIRST - don't call API if validation fails
    const errorsList = validatePassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    const hasErrors = Object.values(errorsList).some((v) => v);
    if (hasErrors) {
      setPasswordError(errorsList);
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ email, oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully!");
    } catch (err) {
      const apiError =
        err.response?.data?.error || "Failed to change password.";
      if (err.response?.status === 401) {
        setPasswordError({ currPass: "Current password is incorrect." });
      } else {
        setPasswordError({ fields: apiError });
      }
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      const accessToken =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!accessToken) {
        throw new Error("Session expired. Please log in again.");
      }

      await selfDeleteAccount({ email: user.email, accessToken });

      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      setDeleteError(
        err?.response?.data?.error ||
          err.message ||
          "Failed to delete account.",
      );
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="account-page">
        <ProfileNavbar />
        <div className="account-info">
          <h1>Account Information</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <ProfileNavbar />
      <div className="account-info">
        <div className="info-display">
          <div className="info-items">
            <img
              className="profile-logo account-img"
              src={profileImage}
              alt="Profile Icon"
            ></img>
            <div className="name-email-wrapper">
              <p className="account-user">
                <strong>{user.name}</strong>
              </p>
              <p className="account-secondary email-text">{email}</p>
              <p className="account-secondary member-text">
                <strong>Member Since:</strong>{" "}
                <span style={{ marginLeft: 0 }}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </p>
              <p className="account-secondary friend-text">
                <strong>Number of Friends:</strong>{" "}
                <span style={{ marginLeft: 0 }}>{friendCount}</span>
              </p>
            </div>
          </div>
        </div>

        <h1 className="account-title">Edit Account Information</h1>
        <hr className="account-separator"></hr>
        <div className="row-info">
          <h2>Name</h2>
          <TextField
            className="name-input"
            value={newName}
            placeholder="Enter new name"
            onChange={(e) => {
              setNewName(e.target.value);
              setNameErrors("");
            }}
            variant="outlined"
          />
        </div>
        {nameErrors && (
          <div className="error-styles">
            <p>{nameErrors}</p>
          </div>
        )}
        {usernameUpdated && (
          <span className="success-styles">{usernameUpdated}</span>
        )}
        <hr className="account-separator" />

        <div className="account-info-buttons">
          <button
            className="signup-button change-password"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
          <button
            className="browse-button save-changes"
            onClick={handleNameChange}
            disabled={userNameLoading}
          >
            {userNameLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {showPasswordModal && (
          <div className="password-modal">
            <form onSubmit={handleChangePassword}>
              <h3>Change Password</h3>
              <div className="input-field-wrapper">
                <div className="label-and-input">
                  <label className="input-label">
                    Current Password<span className="required-field">*</span>
                  </label>
                  <input
                    className="password-input"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <div className="error-styles">
                    {passwordError?.currPass && <p>{passwordError.currPass}</p>}
                  </div>
                </div>
                <div className="label-and-input">
                  <label className="input-label">
                    New Password<span className="required-field">*</span>
                  </label>
                  <input
                    className="password-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError((prev) => ({
                        ...prev,
                        length: "",
                        uppercase: "",
                        number: "",
                        special: "",
                      }));
                    }}
                  />
                  {passwordError && (
                    <div className="error-styles">
                      {passwordError.length && <p>{passwordError.length}</p>}
                      {passwordError.uppercase && (
                        <p>{passwordError.uppercase}</p>
                      )}
                      {passwordError.number && <p>{passwordError.number}</p>}
                      {passwordError.special && <p>{passwordError.special}</p>}
                    </div>
                  )}
                </div>

                <div className="label-and-input">
                  <label className="input-label">
                    Confirm New Password
                    <span className="required-field">*</span>
                  </label>
                  <input
                    className="password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {passwordError.newPass && (
                    <div className="error-styles">{passwordError.newPass}</div>
                  )}
                </div>
                <div className="error-styles">
                  {passwordError.fields && <p>{passwordError.fields}</p>}
                </div>
                {passwordSuccess && (
                  <span className="success-styles">{passwordSuccess}</span>
                )}
              </div>

              <div className="button-styles">
                {!passwordSuccess ? (
                  <>
                    <button
                      className="cancel-btn"
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError({});
                        setPasswordSuccess("");
                      }}
                      disabled={passwordLoading}
                    >
                      Cancel
                    </button>
                    <button
                      className="save-btn"
                      type="submit"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    className="close-btn"
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordSuccess("");
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        <ThemeToggle />

        <div className="delete-account-wrapper">
          <button
            className="delete-account-btn"
            type="button"
            onClick={() => {
              setDeleteError("");
              setShowDeleteModal(true);
            }}
          >
            Delete Account
          </button>
        </div>

        {showDeleteModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal-content">
              <p className="delete-modal-text">
                Are you sure you want to delete your account?
              </p>

              {deleteError && <div className="error-styles">{deleteError}</div>}

              <div className="delete-modal-buttons">
                <button
                  className="cancel-btn"
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  className="delete-confirm-btn"
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;