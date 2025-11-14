import axios from "axios";

const API_BASE_URL = "http://localhost:5050/api";

export const signup = async ({ email, password, name }) => {
  return axios.post(`${API_BASE_URL}/signup`, { email, password, name });
};

export const login = async ({ email, password }) => {
  return axios.post(`${API_BASE_URL}/login`, { email, password });
};

export const confirmEmail = async ({ email, code }) => {
  return axios.post(`${API_BASE_URL}/confirm`, { email, code });
};

export const addBookToBookshelf = async ({ email, volumeId }) => {
  return axios.post(`${API_BASE_URL}/bookshelf/add`, { email, volumeId });
};

export const getBookshelf = async (email) => {
  return axios.get(`${API_BASE_URL}/bookshelf/${email}`);
};

export const getProgress = async (email) => {
  return axios.get(`${API_BASE_URL}/progress/${email}`);
};

export const updateProgress = async ({ email, volumeId, currentPage, totalPages }) => {
  return axios.post(`${API_BASE_URL}/progress/update`, { email, volumeId, currentPage, totalPages });
};

export const getReviews = async (email) => {
  return axios.get(`${API_BASE_URL}/reviews/${email}`);
};

export const addReview = async ({ email, name, volumeId, rating, reviewText }) => {
  return axios.post(`${API_BASE_URL}/reviews/add`, { email, name, volumeId, rating, reviewText });
};

export const getBookReviews = async (volumeId) => {
  return axios.get(`${API_BASE_URL}/reviews/book/${volumeId}`);
};

// FRIEND SYSTEM API CALLS

// Get all users (for searching/discovering friends)
export const getAllUsers = async () => {
  return axios.get(`${API_BASE_URL}/users`);
};

// Search users by name or email
export const searchUsers = async (searchQuery) => {
  return axios.get(`${API_BASE_URL}/users/search`, {
    params: { q: searchQuery }
  });
};

// Send a friend request
export const sendFriendRequest = async ({ senderEmail, receiverEmail }) => {
  return axios.post(`${API_BASE_URL}/friends/request`, { 
    senderEmail, 
    receiverEmail 
  });
};

// Get pending friend requests (received)
export const getPendingRequests = async (email) => {
  return axios.get(`${API_BASE_URL}/friends/requests/pending/${email}`);
};

// Get sent friend requests
export const getSentRequests = async (email) => {
  return axios.get(`${API_BASE_URL}/friends/requests/sent/${email}`);
};

// Accept a friend request
export const acceptFriendRequest = async ({ requestId, userEmail }) => {
  return axios.post(`${API_BASE_URL}/friends/request/accept`, { 
    requestId, 
    userEmail 
  });
};

// Reject/Cancel a friend request
export const rejectFriendRequest = async ({ requestId }) => {
  return axios.post(`${API_BASE_URL}/friends/request/reject`, { 
    requestId 
  });
};

// Get user's friends list
export const getFriends = async (email) => {
  return axios.get(`${API_BASE_URL}/friends/${email}`);
};

// Remove a friend
export const removeFriend = async ({ userEmail, friendEmail }) => {
  return axios.post(`${API_BASE_URL}/friends/remove`, { 
    userEmail, 
    friendEmail 
  });
};

// Check friendship status between two users
export const checkFriendshipStatus = async ({ userEmail, otherUserEmail }) => {
  return axios.get(`${API_BASE_URL}/friends/status`, {
    params: { userEmail, otherUserEmail }
  });
};