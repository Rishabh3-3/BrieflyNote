import axios from "axios";

const API_URL = "http://localhost:8000"; // adjust if backend is running elsewhere

export const signupUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/signup`, { email, password });
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
};
