import axios from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

// Get API base URL - always use the same hostname as the frontend
const getApiBaseUrl = () => {
  // Client-side: construct from current window location
  // This ensures the API uses the same hostname/port as the frontend
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If accessing via domain (no port or port 443/80), use same domain with /api path
    // Nginx will proxy /api/ requests to the backend
    // If accessing via localhost with specific port (like 3012), use backend port 3013
    if (!port || port === '443' || port === '80' || hostname !== 'localhost') {
      // Production/domain access - use same domain, nginx handles routing
      const url = `${protocol}//${hostname}/api`;
      console.log('API Base URL (domain):', url, '(from window.location:', window.location.href + ')');
      return url;
    } else {
      // Local development - use backend port directly
      const backendPort = port === '3012' ? '3013' : '3013';
      const url = `${protocol}//${hostname}:${backendPort}/api`;
      console.log('API Base URL (local):', url, '(from window.location:', window.location.href + ')');
      return url;
    }
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013/api';
};

// Create axios instance with dynamic baseURL
// The baseURL will be determined on each request in the interceptor
const api = axios.create({
  baseURL: '/api', // This will be overridden by the request interceptor
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add token to requests and set correct baseURL
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Set the baseURL dynamically based on current window location
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port;
      
      // If accessing via domain (no port or port 443/80), use same domain with /api path
      // Nginx will proxy /api/ requests to the backend
      // If accessing via localhost with specific port, use backend port directly
      if (!port || port === '443' || port === '80' || hostname !== 'localhost') {
        // Production/domain access - use same domain, nginx handles routing
        config.baseURL = `${protocol}//${hostname}/api`;
      } else {
        // Local development - use backend port directly
        const backendPort = '3013';
        config.baseURL = `${protocol}//${hostname}:${backendPort}/api`;
      }
      
      // Add token if available (check both Zustand and localStorage)
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Request with token:', {
          url: config.url,
          hasToken: !!token,
          tokenPreview: token.substring(0, 20) + '...',
        });
      } else {
        console.warn('Request without token:', {
          url: config.url,
          zustandToken: !!useAuthStore.getState().token,
          localStorageToken: !!localStorage.getItem('token'),
        });
      }
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
    // Only redirect on actual 401/403, not on network errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Authentication error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });
      
      if (typeof window !== 'undefined') {
        // Don't redirect if we're on the admin page or login page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && !currentPath.startsWith('/admin')) {
          console.log('Redirecting to login due to auth error');
          useAuthStore.getState().clearAuth();
          localStorage.removeItem('token');
          localStorage.removeItem('student');
          window.location.href = '/login';
        } else if (currentPath.startsWith('/admin')) {
          // On admin page, just log the error but don't redirect
          console.log('Auth error on admin page (expected for admin access):', error.response?.status);
        }
      }
    } else {
      // Log other errors but don't redirect
      console.error('API error (non-auth):', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export const studentAPI = {
  login: async (applicationId: string) => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port;
      // Use same domain for API calls when accessed via domain (nginx handles routing)
      const apiUrl = (!port || port === '443' || port === '80' || hostname !== 'localhost')
        ? `${protocol}//${hostname}/api/students/login`
        : `${protocol}//${hostname}:3013/api/students/login`;
      console.log('API call - Login:', { applicationId, apiUrl, baseURL: api.defaults.baseURL });
    }
    try {
      const response = await api.post('/students/login', { applicationId });
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.baseURL,
        fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
      });
      throw error;
    }
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

export const adminAPI = {
  getAllStudents: async (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status', status);
    const queryString = params.toString();
    const url = `/students/all${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  scheduleInterview: async (studentId: string, interviewDate: string, interviewInstructions?: string) => {
    const response = await api.patch(`/students/${studentId}/interview`, {
      interviewDate,
      interviewInstructions,
    });
    return response.data;
  },

  scheduleBatchInterviews: async (
    studentIds: string[],
    interviewDate: string,
    interviewInstructions?: string
  ) => {
    // Schedule interviews for multiple students
    const results = await Promise.allSettled(
      studentIds.map((studentId) =>
        api.patch(`/students/${studentId}/interview`, {
          interviewDate,
          interviewInstructions,
        })
      )
    );

    // Return results with success/failure status
    return results.map((result, index) => ({
      studentId: studentIds[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason?.response?.data?.message || result.reason?.message : null,
      data: result.status === 'fulfilled' ? result.value.data : null,
    }));
  },
};

export const interviewAPI = {
  getAll: async (search?: string, outcome?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (outcome && outcome !== 'ALL') params.append('outcome', outcome);
    const queryString = params.toString();
    const url = `/interviews${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/interviews/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  },
};

export const aiAPI = {
  transcribe: async (audioFile: File) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    const response = await api.post('/ai/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes
    });
    return response.data;
  },

  analyze: async (transcript: string, studentName: string, duration: number) => {
    const response = await api.post('/ai/analyze', {
      transcript,
      studentName,
      duration,
    });
    return response.data;
  },

  saveRecording: async (
    interviewDate: string,
    recordingUrl: string,
    duration: number,
    transcript?: string,
    transcriptSegments?: any,
  ) => {
    const response = await api.post('/ai/recording', {
      interviewDate,
      recordingUrl,
      duration,
      transcript,
      transcriptSegments,
    });
    return response.data;
  },

  saveAnalysis: async (recordingId: string, analysisData: any) => {
    const response = await api.post(`/ai/recording/${recordingId}/analysis`, analysisData);
    return response.data;
  },

  getRecording: async (recordingId: string) => {
    const response = await api.get(`/ai/recording/${recordingId}`);
    return response.data;
  },

  getStudentRecordings: async () => {
    const response = await api.get('/ai/recordings/student');
    return response.data;
  },

  getAllRecordings: async () => {
    const response = await api.get('/ai/recordings/all');
    return response.data;
  },
};

export const notificationsAPI = {
  getAll: async (unreadOnly?: boolean) => {
    const params = unreadOnly ? { unreadOnly: 'true' } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  create: async (notification: {
    userId: string;
    userType: 'student' | 'admin';
    title: string;
    message: string;
    type?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) => {
    const response = await api.post('/notifications', notification);
    return response.data;
  },
};

export default api;

