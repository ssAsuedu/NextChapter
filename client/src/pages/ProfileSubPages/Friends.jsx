import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import ErrorIcon from "@mui/icons-material/Error";

import {
  getAllUsers,
  searchUsers,
  sendFriendRequest,
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
  checkFriendshipStatus,
} from "../../api.js";
import "../../styles/ProfilePage/Friends.css";
import ProfileNavbar from "../../components/ProfilePage/ProfileNavbar";
const Friends = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [friendUsername, setFriendUsername] = useState(null);
  const [createdAt, setCreatedAt] = useState([]);

  // Get current user email from localStorage
  const currentUserEmail = localStorage.getItem("userEmail") || "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUserEmail) {
    }
  }, []);

  useEffect(() => {
    if (currentUserEmail) {
      loadFriends();
      loadRequests();
    }
  }, [currentUserEmail]);

  const loadFriends = async () => {
    try {
      setLoading(true);

      const response = await getFriends(currentUserEmail);

      setFriends(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const [pendingRes, sentRes] = await Promise.all([
        getPendingRequests(currentUserEmail),
        getSentRequests(currentUserEmail),
      ]);

      setPendingRequests(pendingRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {}
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      showMessage("Please enter a search term", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await searchUsers(searchQuery);

      // Filter out current user

      const filtered = response.data.filter((user) => {
        if (user.email === currentUserEmail) return false;

        const isFriend = friends.some((f) => f.email === user.email); //find friends that the current user is friends with
        const isPending = pendingRequests.some(
          (req) => req.senderInfo?.email === user.email,
        ); //find pending friend requests
        const isSent = sentRequests.some(
          (req) => req.receiverInfo?.email === user.email,
        ); //find sent friend requests

        return !isFriend && !isPending && !isSent; //only return users in the search that aren't current, pending, or sent friends
      });
      setSearchResults(filtered);

      if (filtered.length === 0) {
      }
    } catch (error) {
      showMessage("Search failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load ALL users from database (not just session)
  const loadAllUsers = async () => {
    try {
      setLoading(true);

      const response = await getAllUsers();

      setCreatedAt(response.data);
      // Filter out current user
      const filtered = response.data.filter((user) => {
        if (user.email === currentUserEmail) return false;

        const isFriend = friends.some((f) => f.email === user.email); //find friends that the current user is friends with
        const isPending = pendingRequests.some(
          (req) => req.senderInfo?.email === user.email,
        ); //find pending friend requests
        const isSent = sentRequests.some(
          (req) => req.receiverInfo?.email === user.email,
        ); //find sent friend requests

        return !isFriend && !isPending && !isSent; //only return users in the search that aren't current, pending, or sent friends
      });

      setSearchResults(filtered);

      if (filtered.length === 0) {
      }
    } catch (error) {
      showMessage("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load all users when switching to "Find Friends" tab
  useEffect(() => {
    if (activeTab === "find") {
      loadAllUsers();
    }
  }, [activeTab, currentUserEmail]);

  const handleSendRequest = async (receiverEmail, updateButtonState) => {
    try {
      await sendFriendRequest({
        senderEmail: currentUserEmail,
        receiverEmail,
      });

      showMessage("Friend request sent!", "success");

      // Reload requests to update sent list
      await loadRequests();

      // Tell the button component to update its state
      if (updateButtonState) {
        updateButtonState("request_sent");
      }
    } catch (error) {
      // Don't show error message at top if it's "Request already sent"
      const errorMsg = error.response?.data?.error || "Failed to send request";
      if (
        !errorMsg.includes("already sent") &&
        !errorMsg.includes("already exists")
      ) {
        showMessage(errorMsg, "error");
      }

      // If error is "already sent", still update button to show that
      if (
        errorMsg.includes("already sent") ||
        errorMsg.includes("already exists")
      ) {
        if (updateButtonState) {
          updateButtonState("request_sent");
        }
      }

      // Refresh requests
      await loadRequests();
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest({ requestId, userEmail: currentUserEmail });
      showMessage("Friend request accepted!", "success");
      loadFriends();
      loadRequests();
    } catch (error) {
      showMessage("Failed to accept request", "error");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFriendRequest({ requestId });
      showMessage("Friend request rejected", "success");
      loadRequests();
    } catch (error) {
      showMessage("Failed to reject request", "error");
    }
  };

  const findUsername = async (userEmail) => {
    const users = await searchUsers(userEmail); //axios searchUsers by email

    const user = users.data.find((u) => u.email === userEmail); //if this email exists, only retrieve the user with the same email as the parameter

    return user ? user.name : null; //return this user's username if they exist, if not, then null
  };

  const handleRemoveFriend = async (friendEmail) => {
    //when the remove button is pressed
    setFriendToRemove(friendEmail); //set state variable of the friend's email to be removed

    const user = await findUsername(friendEmail); //call findUsername function to retrieve friend's username

    setFriendUsername(user); //set state variable to the friend's username
    setShowDeleteModal(true); //show the delete modal
  };

  const friendRemoved = async () => {
    //when the confirm button in the delete modal is clicked
    try {
      await removeFriend({
        userEmail: currentUserEmail,
        friendEmail: friendToRemove,
      }); //call API to remove friend
      showMessage("Friend removed", "success"); //success message
      loadFriends(); //load new friends list
    } catch (error) {
      showMessage("Failed to remove friend", "error"); //could not remove friend
    }

    setShowDeleteModal(false); //hide delete modal now
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 3000);
  };

  const FriendRequestButton = ({ user }) => {
    const [buttonState, setButtonState] = useState("loading");
    const [requestId, setRequestId] = useState(null);

    useEffect(() => {
      if (!currentUserEmail || !user?.email) return;

      const fetchStatus = async () => {
        try {
          const response = await checkFriendshipStatus({
            userEmail: currentUserEmail,
            otherUserEmail: user.email,
          });
          let status = response.data.status;

          // If backend uses "pending" for an outgoing request, show "Request Sent"
          if (status === "pending") {
            status = "request_sent";
          }

          // If we *already* think it's request_sent, don't downgrade to "none"
          setButtonState((prev) => {
            if (prev === "request_sent" && (status === "none" || !status)) {
              return prev; // keep "Request Sent" on screen
            }
            return status || "none";
          });

          if (response.data.requestId) {
            setRequestId(response.data.requestId);
          }
        } catch (error) {
          // Only fallback to "none" if we don't already think it's sent/friends
          setButtonState((prev) =>
            prev === "request_sent" || prev === "friends" ? prev : "none",
          );
        }
      };
      fetchStatus();
    }, [user.email, currentUserEmail]);

    // Check if this user is in sent requests
    useEffect(() => {
      const isSentRequest = sentRequests.some(
        (req) => req.receiverEmail === user.email,
      );
      if (isSentRequest) {
        setButtonState("request_sent");
      }
    }, [sentRequests, user.email]);

    const handleSendClick = async () => {
      // Immediately set to sending state
      setButtonState("sending");

      // Send the request and pass a callback to update button state
      await handleSendRequest(user.email, setButtonState);
    };

    if (buttonState === "loading") {
      return (
        <button disabled className="btn-pending">
          Loading...
        </button>
      );
    }

    if (buttonState === "friends") {
      return (
        <button disabled className="btn-friends">
          ✓ Friends
        </button>
      );
    }

    if (buttonState === "sending") {
      return (
        <button disabled className="btn-pending">
          Sending...
        </button>
      );
    }

    if (buttonState === "request_sent") {
      return (
        <button disabled className="btn-pending">
          Request Sent
        </button>
      );
    }

    if (buttonState === "request_received") {
      return (
        <div className="request-actions">
          <button
            onClick={() => handleAcceptRequest(requestId)}
            className="btn-accept"
          >
            Accept
          </button>
          <button
            onClick={() => handleRejectRequest(requestId)}
            className="btn-reject"
          >
            Decline
          </button>
        </div>
      );
    }

    return (
      <button onClick={handleSendClick} className="btn-add">
        Add Friend
      </button>
    );
  };

  return (
    <div>
      <ProfileNavbar />
      <div className="friends-container">
        <h1 className="friends-title">Friends</h1>

        {!currentUserEmail && (
          <div className="message error">
            ⚠️ No user email found in localStorage. Please login first.
          </div>
        )}

        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="tabs">
          <button
            className={activeTab === "friends" ? "active" : ""}
            onClick={() => setActiveTab("friends")}
          >
            My Friends ({friends.length})
          </button>
          <button
            className={activeTab === "find" ? "active" : ""}
            onClick={() => setActiveTab("find")}
          >
            Find Friends
          </button>
          <button
            className={activeTab === "requests" ? "active" : ""}
            onClick={() => setActiveTab("requests")}
          >
            Requests ({pendingRequests.length})
          </button>
        </div>

        {activeTab === "friends" && (
          <div className="friends-list">
            <h2>Your Friends</h2>
            {loading ? (
              <p>Loading...</p>
            ) : friends.length === 0 ? (
              <p className="empty-state">
                You don't have any friends yet. Search for users to connect!
              </p>
            ) : (
              <div className="user-grid">
                {friends.map((friend) => {
                  const formattedDate = friend.createdAt
                    ? new Date(friend.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A";
                  return (
                    <div
                      key={friend.email}
                      className="user-card"
                      onClick={() =>
                        navigate(`/friend/${encodeURIComponent(friend.email)}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div className="user-info">
                        <h3>{friend.name}</h3>
                        <div className="joined-wrapper">
                          <span className="joined-text">Joined: </span>
                          <p className="join-date">{formattedDate}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFriend(friend.email);
                        }}
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "find" && (
          <div className="find-friends">
            <h2>Find Friends</h2>

            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search users by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn-search">
                Search
              </button>
            </form>

            {loading ? (
              <p className="loading-text">Loading users from database...</p>
            ) : searchResults.length === 0 ? (
              <p className="empty-state">
                {searchQuery
                  ? `No users found matching "${searchQuery}"`
                  : "No other users in the database yet. Invite friends to sign up!"}
              </p>
            ) : (
              <>
                <p style={{ color: "#666", marginBottom: "1rem" }}>
                  Showing {searchResults.length} user
                  {searchResults.length !== 1 ? "s" : ""}
                </p>
                <div className="user-grid">
                  {searchResults.map((user) => {
                    const formattedDate = user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A";

                    return (
                      <div key={user.email} className="user-card">
                        <div className="user-info">
                          <h3>{user.name}</h3>
                          <div className="joined-wrapper">
                            <span className="joined-text">Joined: </span>
                            <p className="join-date">{formattedDate}</p>
                          </div>
                        </div>
                        <FriendRequestButton user={user} />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="requests-section">
            <div className="pending-requests">
              <h2>Pending Requests ({pendingRequests.length})</h2>
              {pendingRequests.length === 0 ? (
                <p className="empty-state">No pending requests</p>
              ) : (
                <div className="user-grid">
                  {pendingRequests.map((request) => (
                    <div key={request._id} className="user-card pending">
                      <div className="user-info">
                        <h3>{request.senderInfo?.name}</h3>
                        <small>
                          Sent{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="btn-accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="btn-reject"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sent-requests">
              <h2>Sent Requests ({sentRequests.length})</h2>
              {sentRequests.length === 0 ? (
                <p className="empty-state">No sent requests</p>
              ) : (
                <div className="user-grid">
                  {sentRequests.map((request) => (
                    <div key={request._id} className="user-card">
                      <div className="user-info">
                        <h3>{request.receiverInfo?.name}</h3>
                        <small>
                          Sent{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="delete-modal">
              <ErrorIcon className="delete-error" fontSize="large" />
              <h2 className="delete-heading">Delete Friend</h2>
              <p className="delete-text">
                Are you sure you want to remove{" "}
                <span className="friend-username">{friendUsername}</span> as a
                friend?
              </p>
              <div className="button-gap">
                <button
                  className="cancel-request"
                  onClick={() => {
                    setShowDeleteModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="confirm-request"
                  onClick={() => {
                    friendRemoved();
                  }}
                >
                  Yes, remove.
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
