import React, { useState, useEffect } from 'react';
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
  checkFriendshipStatus
} from '../../api.js';
import '../../styles/ProfilePage/Friends.css';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get current user email from localStorage
  const currentUserEmail = localStorage.getItem('userEmail') || '';

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
        getSentRequests(currentUserEmail)
      ]);


      setPendingRequests(pendingRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {


    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();


    if (!searchQuery.trim()) {
      showMessage('Please enter a search term', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await searchUsers(searchQuery);


      // Filter out current user
      const filtered = response.data.filter(user => user.email !== currentUserEmail);

      setSearchResults(filtered);

      if (filtered.length === 0) {

      }
    } catch (error) {


      showMessage('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load ALL users from database (not just session)
  const loadAllUsers = async () => {
    try {
      setLoading(true);

      const response = await getAllUsers();



      // Filter out current user
      const filtered = response.data.filter(user => user.email !== currentUserEmail);

      setSearchResults(filtered);

      if (filtered.length === 0) {

      }
    } catch (error) {


      showMessage('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load all users when switching to "Find Friends" tab
  useEffect(() => {
    if (activeTab === 'find') {

      loadAllUsers();
    }
  }, [activeTab, currentUserEmail]);

  const handleSendRequest = async (receiverEmail, updateButtonState) => {
    try {

      await sendFriendRequest({ 
        senderEmail: currentUserEmail, 
        receiverEmail 
      });

      showMessage('Friend request sent!', 'success');

      // Reload requests to update sent list
      await loadRequests();

      // Tell the button component to update its state
      if (updateButtonState) {
        updateButtonState('request_sent');
      }
    } catch (error) {



      // Don't show error message at top if it's "Request already sent"
      const errorMsg = error.response?.data?.error || 'Failed to send request';
      if (!errorMsg.includes('already sent') && !errorMsg.includes('already exists')) {
        showMessage(errorMsg, 'error');
      }

      // If error is "already sent", still update button to show that
      if (errorMsg.includes('already sent') || errorMsg.includes('already exists')) {
        if (updateButtonState) {
          updateButtonState('request_sent');
        }
      }

      // Refresh requests
      await loadRequests();
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {

      await acceptFriendRequest({ requestId, userEmail: currentUserEmail });
      showMessage('Friend request accepted!', 'success');
      loadFriends();
      loadRequests();
    } catch (error) {


      showMessage('Failed to accept request', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {

      await rejectFriendRequest({ requestId });
      showMessage('Friend request rejected', 'success');
      loadRequests();
    } catch (error) {


      showMessage('Failed to reject request', 'error');
    }
  };

  const handleRemoveFriend = async (friendEmail) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {

      await removeFriend({ userEmail: currentUserEmail, friendEmail });
      showMessage('Friend removed', 'success');
      loadFriends();
    } catch (error) {


      showMessage('Failed to remove friend', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const FriendRequestButton = ({ user }) => {
    const [buttonState, setButtonState] = useState('loading');
    const [requestId, setRequestId] = useState(null);

    useEffect(() => {
      const fetchStatus = async () => {
        try {
          const response = await checkFriendshipStatus({
            userEmail: currentUserEmail,
            otherUserEmail: user.email
          });
          let status = response.data.status;


          // If backend uses "pending" for an outgoing request, show "Request Sent"
          if (status === 'pending') {
            status = 'request_sent';
          }

          // If we *already* think it's request_sent, don't downgrade to "none"
          setButtonState(prev => {
            if (prev === 'request_sent' && (status === 'none' || !status)) {
              return prev; // keep "Request Sent" on screen
            }
            return status || 'none';
          });

          if (response.data.requestId) {
            setRequestId(response.data.requestId);
          }
        } catch (error) {

          // Only fallback to "none" if we don't already think it's sent/friends
          setButtonState(prev => (prev === 'request_sent' || prev === 'friends' ? prev : 'none'));
        }
      };
      fetchStatus();
    }, [user.email, currentUserEmail]);



    // Check if this user is in sent requests
    useEffect(() => {
      const isSentRequest = sentRequests.some(req => req.receiverEmail === user.email);
      if (isSentRequest) {

        setButtonState('request_sent');
      }
    }, [sentRequests, user.email]);

    const handleSendClick = async () => {
      // Immediately set to sending state
      setButtonState('sending');

      // Send the request and pass a callback to update button state
      await handleSendRequest(user.email, setButtonState);
    };

    if (buttonState === 'loading') {
      return <button disabled className="btn-pending">Loading...</button>;
    }

    if (buttonState === 'friends') {
      return <button disabled className="btn-friends">✓ Friends</button>;
    }

    if (buttonState === 'sending') {
      return <button disabled className="btn-pending">Sending...</button>;
    }

    if (buttonState === 'request_sent') {
      return <button disabled className="btn-pending">Request Sent</button>;
    }

    if (buttonState === 'request_received') {
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
      <button 
        onClick={handleSendClick}
        className="btn-add"
      >
        Add Friend
      </button>
    );
  };

  return (
    <div className="friends-container">
      <h1>Friends</h1>

      {!currentUserEmail && (
        <div className="message error">
          ⚠️ No user email found in localStorage. Please login first.
        </div>
      )}

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
        >
          My Friends ({friends.length})
        </button>
        <button 
          className={activeTab === 'find' ? 'active' : ''}
          onClick={() => setActiveTab('find')}
        >
          Find Friends
        </button>
        <button 
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({pendingRequests.length})
        </button>
      </div>

      {activeTab === 'friends' && (
        <div className="friends-list">
          <h2>Your Friends</h2>
          {loading ? (
            <p>Loading...</p>
          ) : friends.length === 0 ? (
            <p className="empty-state">You don't have any friends yet. Search for users to connect!</p>
          ) : (
            <div className="user-grid">
              {friends.map(friend => (
                <div key={friend.email} className="user-card">
                  <div className="user-info">
                    <h3>{friend.name}</h3>
                    <p>{friend.email}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveFriend(friend.email)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'find' && (
        <div className="find-friends">
          <h2>Find Friends</h2>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">Search</button>
          </form>

          {loading ? (
            <p>Loading users from database...</p>
          ) : searchResults.length === 0 ? (
            <p className="empty-state">
              {searchQuery 
                ? `No users found matching "${searchQuery}"`
                : "No other users in the database yet. Invite friends to sign up!"}
            </p>
          ) : (
            <>
              <p style={{color: '#666', marginBottom: '1rem'}}>
                Showing {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="user-grid">
                {searchResults.map(user => (
                  <div key={user.email} className="user-card">
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                    </div>
                    <FriendRequestButton user={user} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="requests-section">
          <div className="pending-requests">
            <h2>Pending Requests ({pendingRequests.length})</h2>
            {pendingRequests.length === 0 ? (
              <p className="empty-state">No pending requests</p>
            ) : (
              <div className="user-grid">
                {pendingRequests.map(request => (
                  <div key={request._id} className="user-card">
                    <div className="user-info">
                      <h3>{request.senderInfo?.name}</h3>
                      <p>{request.senderInfo?.email}</p>
                      <small>Sent {new Date(request.createdAt).toLocaleDateString()}</small>
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
                {sentRequests.map(request => (
                  <div key={request._id} className="user-card">
                    <div className="user-info">
                      <h3>{request.receiverInfo?.name}</h3>
                      <p>{request.receiverInfo?.email}</p>
                      <small>Sent {new Date(request.createdAt).toLocaleDateString()}</small>
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
    </div>
  );
};

export default Friends;