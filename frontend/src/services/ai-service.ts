import api from '@/utils/axios-client';

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
