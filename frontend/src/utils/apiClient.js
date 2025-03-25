import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_BASE_URL , // replace with your API base URL
  // baseURL:'http://localhost:8080',
  timeout: 10000, // optional timeout, in ms
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests (optional)
apiClient.interceptors.request.use(
  (config) => {
    // Optionally attach token or modify headers
    // Example:
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses (optional)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally (e.g., show toast notifications, redirect on 401)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("authToken");
      useNavigate("/")
    }
    return Promise.reject(error);
  }
);

export default apiClient;
