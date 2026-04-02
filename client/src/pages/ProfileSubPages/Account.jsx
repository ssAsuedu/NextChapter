import React, { useEffect, useState } from 'react';
import "../../styles/ProfilePage/Account.css";
import profileImage from "../../assets/profile2.svg";
import ProfileNavbar from '../../components/ProfilePage/ProfileNavbar';
import { getAllUsers, getFriends, updateUserName, changePassword } from '../../api';
import { TextField, Button} from "@mui/material"
import ThemeToggle from "../../components/LandingPage/ThemeToggle";

const Account = () => {
  const email = localStorage.getItem("userEmail");
  const [user, setUser] = useState(null);
  const [friendCount, setFriendCount] = useState(0);
  const [usernameUpdated, setUsernameUpdated] = useState("");
  const [newName, setNewName] = useState("");
  const [userNameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState();
  const [emptyInputs, setEmptyInputs] = useState(false);

  const validatePassword = (oldPassword, newPassword, confirmPassword) => {
    const errors = {
      length: "",
      uppercase: "", 
      number: "",
      special: "",
      newPass: "",
      currPass: "",
    };

    const specialSymbols = "!@#$%^&*";
    if (!oldPassword || !newPassword || !confirmPassword) {
      setShowPasswordModal(true); // show modal when there are errors
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      errors.fields = "All fields are required."; //first error type is all fields are required
    }

    if (newPassword !== confirmPassword) {
      setShowPasswordModal(true); // show modal when there are errors
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");  
      errors.newPass = "New passwords do not match."; //second error type is passwords dont match
      
    }
    if (newPassword.length < 8) {
      setShowPasswordModal(true); // show modal when there are errors
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");  
      errors.length = "Password must be at least 8 characters."; //third error stype is that password must be 8 characters at least
      
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.uppercase = "Password must include at least one uppercase letter.";
    }
    
    if (!/[0-9]/.test(newPassword)) {
      errors.number = "Password must include at least one number.";
    }

    if(!specialSymbols.split("").some(symbol => newPassword.includes(symbol))) {
      errors.special = "Password must include at least one special character !@#$%^&*.";
    }

    return errors;
  };
  
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
    if (!newName.trim() || newName.trim() === user.name) {
      console.log("hello");
      setEmptyInputs(true);
      return;
    }
    try {
      setUsernameLoading(true);
      await updateUserName({ email: user.email, name: newName.trim() });
      setUser({ ...user, name: newName.trim() });
      localStorage.setItem("userName", newName.trim());
      setUsernameUpdated("Username successfully updated.");
      
    } catch (err) {
      // alert("Failed to update name.");
      setEmptyInputs(true);
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
    const errorsList =  validatePassword(oldPassword, newPassword, confirmPassword)
    
    try {
      await changePassword({ email, oldPassword, newPassword }); // Use the API function here
      setPasswordLoading(true);
      setShowPasswordModal(true); // show modal when there are errors
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully!");
      
    } catch (err) {
      if(err.response?.status === 401) {
        console.log("hello");
        errorsList.currPass = "Current password is incorrect.";
        setPasswordLoading(false);
      }
      setShowPasswordModal(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");  
      setPasswordLoading(false);  
      const apiError = err.response?.data?.error || "Failed to change password.";
    }
    setPasswordError(errorsList);

    if (passwordSuccess != " ") {
      setShowPasswordModal(true);
    }
    setTimeout(() => {
        setPasswordSuccess("");
      }, 3000);
      
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
            <img className="profile-logo account-img" src={profileImage} alt="Profile Icon"></img>
            <div className="name-email-wrapper">
              <p className="account-user"><strong>{user.name}</strong></p>
              <p className="account-secondary email-text">{email}</p>
              <p className="account-secondary member-text"><strong>Member Since:</strong> <span style={{ marginLeft: 0 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span></p>
              <p className="account-secondary friend-text"><strong>Number of Friends:</strong> <span style={{ marginLeft: 0 }}>{friendCount}</span></p>
            </div>
          </div>
        </div>
        
        <h1 className="account-title">Edit Account Information</h1>
        <hr className="account-separator"></hr>
        <div className="row-info">
          <h2>Name</h2>
          <TextField className="name-input"
            placeholder="Enter new name"
            onChange={e => {
              setNewName(e.target.value)
              setEmptyInputs(false);
            }}
            variant="outlined"
          />
        </div>
        {emptyInputs && (
          <div className="error-styles">
            <p>Please enter a new name.</p>
            </div>
        )}
        {usernameUpdated && (
          <span className="success-styles">{usernameUpdated}</span>
        )}
        <hr className="account-separator" />
        
          <div className="account-info-buttons">
            <button className="signup-button change-password" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
          <button className="browse-button save-changes" onClick={(handleNameChange)} disabled={userNameLoading}>{userNameLoading ? "Saving..." : "Save Changes"}</button>
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
                  <input className="password-input"
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                  />
                  <div className="error-styles">
                    {passwordError?.currPass && <p>{passwordError.currPass}</p>}
                  </div>
                </div>
                <div className="label-and-input">
                  <label className="input-label">
                    New Password<span className="required-field">*</span>
                    </label>
                    <input className="password-input"
                      type="password"
                      value={newPassword}
                      onChange={e => {
                        setNewPassword(e.target.value)
                        if(passwordError.length) {
                          setPasswordError((prev) => ({
                            ...prev,
                            length: "",
                          }));
                        };
                        if(passwordError.uppercase) {
                          setPasswordError((prev) => ({
                            ...prev,
                            uppercase: "",
                          }));
                        };
                        if(passwordError.number) {
                          setPasswordError((prev) => ({
                            ...prev,
                            number: "",
                          }));
                        };
                        if(passwordError.special) {
                          setPasswordError((prev) => ({
                            ...prev,
                            special: "",
                          }));
                        };
                      }}
                    />
                    {passwordError && (
                      <div className="error-styles">
                      {passwordError.length != "" && <p>{passwordError.length}</p>}
                      {passwordError.uppercase && <p>{passwordError.uppercase}</p>}
                      {passwordError.number && <p>{passwordError.number}</p>}
                      {passwordError.special && <p>{passwordError.special}</p>}
                    </div>
                    )}
                    
                </div>
                
                <div className="label-and-input">
                  <label className="input-label">
                      Confirm New Password<span className="required-field">*</span>
                    </label>
                    <input className="password-input"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    {passwordError.newPass && <div className="error-styles">{passwordError.newPass}</div>}
                </div>
                <div className="error-styles">
                  {passwordError.fields && <p>{passwordError.fields}</p>}
                </div>
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
                      setPasswordError({});
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
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Account;