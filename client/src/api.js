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

export const deleteBookFromBookshelf = async ({ email, volumeId }) => {
  return axios.post(`${API_BASE_URL}/bookshelf/delete`, { email, volumeId });
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

export const addReview = async ({ email, volumeId, rating, reviewText }) => {
  return axios.post(`${API_BASE_URL}/reviews/add`, { email, volumeId, rating, reviewText });
};

export const getBookReviews = async (volumeId) => {
  return axios.get(`${API_BASE_URL}/reviews/book/${volumeId}`);
};