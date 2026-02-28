import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

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

export const deleteBookFromBookshelf = async ({ email, volumeId }) => {
  return axios.post(`${API_BASE_URL}/bookshelf/delete`, { email, volumeId });
};

export const getBookshelf = async (email) => {
  return axios.get(`${API_BASE_URL}/bookshelf/${email}`);
};

export const createList = async ({ email, name, privacy, books }) => {
    return axios.post(`${API_BASE_URL}/lists`, { email, name, privacy, books });
  };
  
  export const deleteList = async (listId) => {
    return axios.delete(`${API_BASE_URL}/lists/${listId}`);
  };
  
  export const updateList = async ({ email, listId, name, privacy, books }) => {
    return axios.post(`${API_BASE_URL}/lists/edit`, { email, listId, name, privacy, books });
  };
  
  export const getUserLists = async (email) => {
    return axios.get(`${API_BASE_URL}/lists/${email}`);
  };

export const getProgress = async (email) => {
  return axios.get(`${API_BASE_URL}/progress/${email}`);
};

export const updateProgress = async ({ email, volumeId, currentPage, totalPages }) => {
  return axios.post(`${API_BASE_URL}/progress/update`, { email, volumeId, currentPage, totalPages });
};
// code for getting all of a users badges 
export const getBadges = async (email) => {
  return axios.get(`${API_BASE_URL}/badges/${email}`);
};

export const getReviews = async (email) => {
  return axios.get(`${API_BASE_URL}/reviews/${email}`);
};

export const addReview = async ({ email, name, volumeId, rating, reviewText }) => {
  return axios.post(`${API_BASE_URL}/reviews/add`, { email, name, volumeId, rating, reviewText });
};

export const deleteReview = async ({ email, volumeId }) => {
  return axios.post(`${API_BASE_URL}/reviews/delete`, { email, volumeId });
};

export const editReview = async ({ email, volumeId, rating, reviewText }) => {
  return axios.post(`${API_BASE_URL}/reviews/edit`, { email, volumeId, rating, reviewText });
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

// TRENDING BOOKS

export const getTrendingBooks = async (limit = 12) => {
  return axios.get(`${API_BASE_URL}/trending`, { params: { limit } });
};

// WISHLIST API CALLS

export const getWishlist = async (email) => {
  return axios.get(`${API_BASE_URL}/wishlist/${email}`);
};

export const addToWishlist = async ({ email, volumeId }) => {
  return axios.post(`${API_BASE_URL}/wishlist/add`, { email, volumeId });
};

export const removeFromWishlist = async ({ email, volumeId }) => {
  return axios.post(`${API_BASE_URL}/wishlist/remove`, { email, volumeId });
};

export const moveWishlistToBookshelf = async ({ email, volumeId }) => {
  return axios.post(`${API_BASE_URL}/wishlist/move-to-bookshelf`, { email, volumeId });
};

export const updateUserName = async ({ email, name }) => {
  return axios.post(`${API_BASE_URL}/users/update-name`, { email, name });
};

export const changePassword = async ({ email, oldPassword, newPassword }) => {
  return axios.post(`${API_BASE_URL}/users/change-password`, { email, oldPassword, newPassword });
};
// ============ STREAK API CALLS ============
// Get streak data (current streak, longest streak, 90-day activity)
export const getStreak = async (email) => {
  return axios.get(`${API_BASE_URL}/streak/${email}`);
};

// Log reading activity for today
export const logReadingActivity = async ({ email }) => {
  return axios.post(`${API_BASE_URL}/streak/log`, { email });
};

// Use a streak freeze
export const useStreakFreeze = async ({ email }) => {
  return axios.post(`${API_BASE_URL}/streak/freeze`, { email });
};


// BOOK JOURNAL API CALLS
export const getJournalEntries = async (email, volumeId) => {
  return axios.get(`${API_BASE_URL}/journal/${email}/${volumeId}`);
};

export const getAllJournalEntries = async (email, searchQuery) => {
  const params = searchQuery ? { q: searchQuery } : {};
  return axios.get(`${API_BASE_URL}/journal/${email}`, { params });
};

export const createJournalEntry = async ({ email, volumeId, title, content }) => {
  return axios.post(`${API_BASE_URL}/journal/create`, { email, volumeId, title, content });
};

export const updateJournalEntry = async ({ email, entryId, title, content }) => {
  return axios.post(`${API_BASE_URL}/journal/update`, { email, entryId, title, content });
};

export const deleteJournalEntry = async ({ email, entryId }) => {
  return axios.post(`${API_BASE_URL}/journal/delete`, { email, entryId });
};

// MOOD FINDER API CALLS

export const getAvailableMoods = async () => {
  return axios.get(`${API_BASE_URL}/mood/moods`);
};

export const getBooksByMood = async (moodIds) => {
  return axios.get(`${API_BASE_URL}/mood/books`, { params: { moods: moodIds.join(",") } });
};

export const getSurpriseMoods = async () => {
  return axios.get(`${API_BASE_URL}/mood/surprise`);
};