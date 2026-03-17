import api from '@/utils/axios-client';

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
};
