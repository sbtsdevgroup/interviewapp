import axios from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

// Create axios instance with dynamic baseURL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests and set correct baseURL
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port;
      
      if (!port || port === '443' || port === '80' || hostname !== 'localhost') {
        config.baseURL = `${protocol}//${hostname}/api`;
      } else {
        const backendPort = '3013';
        config.baseURL = `${protocol}//${hostname}:${backendPort}/api`;
      }
      
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && !currentPath.startsWith('/admin')) {
          useAuthStore.getState().clearAuth();
          localStorage.removeItem('token');
          localStorage.removeItem('student');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
