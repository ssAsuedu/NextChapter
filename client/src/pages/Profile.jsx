import React from "react";

const Profile = () => {
  const userName = localStorage.getItem("userName");

  return (
    <div style={{ marginTop: "80px", padding: "20px" }}>
      <h1>Welcome{userName ? `, ${userName}` : " to Your Profile"}</h1>
      <p>This is your profile page.</p>
    </div>
  );
};

export default Profile;