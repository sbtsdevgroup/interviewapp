import axios from 'axios';

// Use environment variable or default to localhost
// In Docker, this should be set to the backend container URL or host port
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3013/api'  // Default to host port when running locally
    : `http://${window.location.hostname}:3013/api`);  // Use hostname when in Docker

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('student');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const studentAPI = {
  login: async (applicationId) => {
    const response = await api.post('/students/login', { applicationId });
    return response.data;
  },

  getStudentData: async () => {
    const response = await api.get('/students/me');
    return response.data;
  },

  getInterviewStatus: async () => {
    const response = await api.get('/students/interview-status');
    return response.data;
  },
};

export default api;

