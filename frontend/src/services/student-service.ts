import api from '@/utils/axios-client';

export const studentAPI = {
  login: async (applicationId: string, password?: string) => {
    try {
      const response = await api.post('/students/login', { applicationId, password });
      return response.data;
    } catch (error: any) {
      console.error('API error:', error);
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
