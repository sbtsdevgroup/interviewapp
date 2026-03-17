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
      // Prioritize environment variable if set
      const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (envApiUrl && !envApiUrl.includes('localhost')) {
        config.baseURL = envApiUrl;
      } else {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;

        // If we are on a custom port like 3080, and not localhost, 
        // we might still need the backend port 5000
        if (hostname !== 'localhost' && (!port || port === '80' || port === '443')) {
          config.baseURL = `${protocol}//${hostname}/api`;
        } else {
          // Default to port 5000 if we're on a custom frontend port or localhost
          const backendPort = '5000';
          config.baseURL = `${protocol}//${hostname}:${backendPort}/api`;
        }
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

// Handle token expiration and unwrap standard response
api.interceptors.response.use(
  (response) => {
    // If the response follows our standard format { status, message, data }, unwrap it
    if (response.data && response.data.status && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
        fullResponse: response.data // Keep the full response if needed
      };
    }
    return response;
  },
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
