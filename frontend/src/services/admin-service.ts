import api from '@/utils/axios-client';

export const adminAPI = {
  getAllStudents: async (search?: string, status?: string, page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
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
    const results = await Promise.allSettled(
      studentIds.map((studentId) =>
        api.patch(`/students/${studentId}/interview`, {
          interviewDate,
          interviewInstructions,
        })
      )
    );

    return results.map((result, index) => ({
      studentId: studentIds[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason?.response?.data?.message || result.reason?.message : null,
      data: result.status === 'fulfilled' ? result.value.data : null,
    }));
  },

  getStats: async () => {
    const response = await api.get('/students/stats');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/students/stats/analytics');
    return response.data;
  },
  getInterviewSummary: async (interviewId: string) => {
    const response = await api.get(`/ai/interview/${interviewId}/summary`);
    return response.data;
  },
  getStudentInterviewSummary: async (studentId: string) => {
    const response = await api.get(`/ai/student/${studentId}/summary`);
    return response.data;
  },
};
