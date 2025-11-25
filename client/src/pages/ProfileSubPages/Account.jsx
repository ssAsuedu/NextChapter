import React, { useEffect, useState } from 'react';
import "../../styles/ProfilePage/Account.css";
import ProfileNavbar from '../../components/ProfilePage/ProfileNavbar';
import { getAllUsers, getFriends, updateUserName } from '../../api';
import axios from "axios";

const API_BASE_URL = "http://localhost:5050/api";

const Account = () => {
  const email = localStorage.getItem("userEmail");
  const [user, setUser] = useState(null);
  const [friendCount, setFriendCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;
      try {
        const usersRes = await getAllUsers();
        const foundUser = usersRes.data.find(u => u.email === email);
        setUser(foundUser);
        setNewName(foundUser?.name || "");
        const friendsRes = await getFriends(email);
        setFriendCount(Array.isArray(friendsRes.data) ? friendsRes.data.length : 0);
      } catch (err) {
        setUser(null);
        setFriendCount(0);
      }
    };
    fetchUserData();
  }, [email]);

  const handleNameChange = async () => {
    if (!newName.trim() || !user) return;
    setLoading(true);
    try {
      await updateUserName({ email: user.email, name: newName.trim() });
      setUser({ ...user, name: newName.trim() });
      localStorage.setItem("userName", newName.trim());
      setEditing(false);
    } catch (err) {
      alert("Failed to update name.");
    }
    setLoading(false);
  };

  // Password change handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setShowPasswordModal(false);  
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");  
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");  
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/users/change-password`, {
        email,
        oldPassword,
        newPassword,
      });
      setShowPasswordModal(false); // Hide modal first
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully!");
    } catch (err) {
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");    
      setPasswordError(err.response?.data?.error || "Failed to change password.");
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
        <h1 className="account-title">Account Information</h1>
        <div className="account-info-row">
          <strong>Name:</strong>
          {editing ? (
            <>
              <input
                className="edit-name-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                disabled={loading}
              />
              <button className="cancel-btn" onClick={() => { setEditing(false); setNewName(user.name); }} disabled={loading}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleNameChange} disabled={loading || !newName.trim()}>
                Save
              </button>
            </>
          ) : (
            <>
              <span style={{ marginLeft: 8 }}>{user.name}</span>
              <button className="edit-btn" onClick={() => setEditing(true)}>Change Name</button>
            </>
          )}
        </div>
        <hr className="account-separator" />
        <div className="account-info-row">
          <strong>Email:</strong>
          <span style={{ marginLeft: 8 }}>{user.email}</span>
        </div>
        <hr className="account-separator" />
        <div className="account-info-row">
          <strong>Member Since:</strong>
          <span style={{ marginLeft: 8 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
        </div>
        <hr className="account-separator" />
        <div className="account-info-row">
          <strong>Number of Friends:</strong>
          <span style={{ marginLeft: 8 }}>{friendCount}</span>
        </div>
        <hr className="account-separator" />
        <div className="account-info-row">
          <button className="edit-btn" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
        </div>
        {passwordError && <div className="message error">{passwordError}</div>}
        {passwordSuccess && <div className="message success">{passwordSuccess}</div>}
        {showPasswordModal && (
          <div className="password-modal">
            <form onSubmit={handleChangePassword}>
              <h3>Change Password</h3>
              <input
                type="password"
                placeholder="Current Password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <div style={{ marginTop: "12px", alignItems: "center", display: "flex", justifyContent: "center", gap: "12px" }}>
              
                <button
                  className="cancel-btn"
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                >
                  Cancel
                </button>
                 <button className="save-btn" type="submit">Save</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;