/**
 * Shared Axios instance with auth interceptor.
 */
import axios from 'axios';

const client = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor – unwrap ApiResponse envelope
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if the user had a session (token expired).
      // For guest browsing (no token), let the component handle the 401.
      const hadToken = localStorage.getItem('accessToken');
      if (hadToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default client;
