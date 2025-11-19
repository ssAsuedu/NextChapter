import React, { useEffect, useState } from 'react';
import "../../styles/ProfilePage/Account.css";
import ProfileNavbar from '../../components/ProfilePage/ProfileNavbar';
import { getAllUsers, getFriends, updateUserName } from '../../api';

const Account = () => {
  const email = localStorage.getItem("userEmail");
  const [user, setUser] = useState(null);
  const [friendCount, setFriendCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

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
      localStorage.setItem("userName", newName.trim()); // <-- update local storage
      setEditing(false);
    } catch (err) {
      alert("Failed to update name.");
    }
    setLoading(false);
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
        <h1>Account Information</h1>
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
      </div>
    </div>
  );
};

export default Account;