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
      
      // Prioritize environment variable if set
      let envApiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // If the environment variable points to localhost but we are not on localhost,
      // it means the build was bundled with a local default, but we should use the current host
      if (envApiUrl && envApiUrl.includes('localhost') && hostname !== 'localhost') {
        const urlObj = new URL(envApiUrl);
        const backendPort = urlObj.port === '3013' || urlObj.port === '5000' || urlObj.port === '3081' ? '3081' : urlObj.port;
        let base = `${protocol}//${hostname}${backendPort ? `:${backendPort}` : ''}${urlObj.pathname}`;
        config.baseURL = base.endsWith('/') ? base : `${base}/`;
      } else if (envApiUrl) {
        config.baseURL = envApiUrl.endsWith('/') ? envApiUrl : `${envApiUrl}/`;
      } else {
        // Fallback smart detection
        if (hostname !== 'localhost' && (!port || port === '80' || port === '443')) {
          config.baseURL = `${protocol}//${hostname}/api/`;
        } else {
          // Default to port 3081 for production/custom ports, as seen in docker-compose
          const backendPort = hostname === 'localhost' ? '5000' : '3081';
          config.baseURL = `${protocol}//${hostname}:${backendPort}/api/`;
        }
      }
      
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Ensure that if the URL starts with a slash, it doesn't override the baseURL path
      if (config.url?.startsWith('/')) {
        config.url = config.url.substring(1);
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
        useAuthStore.getState().clearAuth();
        
        if (currentPath.startsWith('/admin') || currentPath.startsWith('/auth/admin')) {
          window.location.href = '/auth/admin';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
