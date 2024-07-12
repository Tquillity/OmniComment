// authServices.js

import axios from 'axios';

const API_URL = 'http://localhost:5001/api/v1/auth';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred during registration.');
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred during login.');
  }
};

export const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching user info');
  }
};
