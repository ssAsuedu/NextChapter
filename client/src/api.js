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