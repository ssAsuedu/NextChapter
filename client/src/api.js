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