import React, { useEffect, useState } from 'react';
import "../../styles/ProfilePage/Account.css";
import profileImage from "../../assets/profile2.svg";
import ProfileNavbar from '../../components/ProfilePage/ProfileNavbar';
import { getAllUsers, getFriends, updateUserName, changePassword } from '../../api';
import { TextField, Button} from "@mui/material"

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
  const [passwordError, setPasswordError] = useState([]);
  const [passwordSuccess, setPasswordSuccess] = useState();

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
    setPasswordError([]);
    setPasswordSuccess("");
    const errorsList = []; //create an array that stores every possible error type
    const specialSymbols = "!@#$%^&*"; //symbols that are acceptable in a password

    if (!oldPassword || !newPassword || !confirmPassword) {
      setShowPasswordModal(true); // show modal when there are errors
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      errorsList[0] = "All fields are required."; //first error type is all fields are required
      
      
    }
    if (newPassword !== confirmPassword) {
      setShowPasswordModal(true); // show modal when there are errors
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");  
      errorsList[1] = "New passwords do not match."; //second error type is passwords dont match
      
    }
    if (newPassword.length < 8) {
      setShowPasswordModal(true); // show modal when there are errors
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");  
      errorsList[2] = "Password must be at least 8 characters."; //third error stype is that password must be 8 characters at least
      
    }
    if (!/[A-Z]/.test(newPassword)) {
      errorsList[3] = "Password must include at least one uppercase letter.";
    }
    
    if (!/[0-9]/.test(newPassword)) {
      errorsList[4] = "Password must include at least one number.";
    }

    if(!specialSymbols.split("").some(symbol => newPassword.includes(symbol))) {
      errorsList[5] = "Password must include at least one special character !@#$%^&*.";
    }

    if (errorsList.length > 0) {
      setPasswordError(errorsList);
      setShowPasswordModal(true);
      return;
    }
    try {
      await changePassword({ email, oldPassword, newPassword }); // Use the API function here
      setShowPasswordModal(true); // show modal when there are errors
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully!");
      setPasswordError([]);
    } catch (err) {
      setShowPasswordModal(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");    
      const apiError = err.response?.data?.error || "Failed to change password.";
      setPasswordError(Array.isArray(apiError) ? apiError: [apiError]);
    }

    if (passwordSuccess != " ") {
      setShowPasswordModal(true);
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
          <img className="profile-logo account-img" src={profileImage} alt="Profile Icon"></img>
          <div className="name-email-wrapper">
            <p className="account-user"><strong>{user.name}</strong></p>
            <p className="account-secondary email-text">{email}</p>
            <p className="account-secondary member-text"><strong>Member Since:</strong> <span style={{ marginLeft: 0 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span></p>
            <p className="account-secondary friend-text"><strong>Number of Friends:</strong> <span style={{ marginLeft: 0 }}>{friendCount}</span></p>
          </div>
        </div>
        
        <h1 className="account-title">Edit Account Information</h1>
        <hr className="account-separator"></hr>
        <div className="row-info">
          <h2>Name</h2>
          <TextField className="name-input"
            placeholder="Enter new name"
            // value={newName}
            onChange={e => setNewName(e.target.value)}
            variant="outlined"
          />
        </div>
        <hr className="account-separator" />
        
          <div className="account-info-buttons">
            <button className="signup-button change-password" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
          <button className="browse-button save-changes" onClick={(handleNameChange)}>Save Changes</button>
          </div>
        
        {/* {passwordError && <div className="error-styles">{passwordError}</div>} */}
        
        {showPasswordModal && (
          <div className="password-modal">
            <form onSubmit={handleChangePassword}>
              <h3>Change Password</h3>
              <div className="input-field-wrapper">
                <div className="label-and-input">
                  <label className="input-label">
                    Current Password<span className="required-field">*</span>
                    </label>
                  <input className="password-input"
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    
                    // error={!!passwordError}
                  />
                  {/* {passwordError && <div className="error-styles">{passwordError}</div>} */}
                </div>
                <div className="label-and-input">
                  <label className="input-label">
                    New Password<span className="required-field">*</span>
                    </label>
                    <input className="password-input"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      // error={!!passwordError}
                    />
                    {passwordError.slice(2,6).map((err, idx) => ( //splits the array from indices 2-5, map creates a span for every error
                      err ? <span key={idx} className="error-styles">{err}</span> : null //if an error exists, create a span for that indices error and display it. otherwise, don't display it. 
                    ))}
                </div>
                
                <div className="label-and-input">
                  <label className="input-label">
                      Confirm New Password<span className="required-field">*</span>
                    </label>
                    <input className="password-input"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      // error={!!passwordError}
                    />
                    {/* {passwordError && <div className="error-styles">{passwordError}</div>} */}
                </div>
                <span className="error-styles">{passwordError[0]}</span>
                {passwordSuccess && (<span className="success-styles">{passwordSuccess}</span>)}
              </div>
              
              <div className="button-styles">
                {!passwordSuccess ? ( //if the password is not successful, that means the user has not changed their password yet
                  <>
                    <button //display the cancel and save button when the password has not been changed yet
                      className="cancel-btn"
                      type="button"
                      onClick={() => {
                      setShowPasswordModal(false);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError([]);
                      setPasswordSuccess("");
                    }}
                    >
                    Cancel
                    </button>
                      <button className="save-btn" type="submit">Save</button>
                  </>
                ) : ( //otherwise, if the password change was successful, then create a button that will close the password modal when clicked on
                  <button 
                  className="close-btn" 
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
        
      </div>
    </div>
  );
};

export default Account;