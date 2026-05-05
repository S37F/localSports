import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — attach auth token if present
api.interceptors.request.use(
  (config) => {
    // Token is injected by AuthContext at call-time via the api instance
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalise errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
