import api from '@/utils/axios-client';

export interface AIInterview {
  id: string;
  student_id: string;
  schedule_date: string;
  instructions: string;
  status: 'PENDING' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
  started_at: string | null;
  created_at: string;
}

export interface AIQuestion {
  id: string;
  text: string;
  type: string;
  category?: string;
  options?: string[]; // Will be parsed from JSON string if needed, or expected as array from API
  criteria: string;
  is_published: number;
}

export interface AIResponse {
  id: string;
  interviewId: string;
  questionId: string;
  score: number;
  feedback: string;
}

export const aiInterviewAPI = {
  getPendingInterview: async (): Promise<AIInterview> => {
    const response = await api.get('/ai/interview/pending');
    return response.data;
  },

  getPublishedQuestions: async (): Promise<AIQuestion[]> => {
    const response = await api.get('/ai/questions/published');
    return response.data;
  },

  startInterview: async (interviewId: string): Promise<AIInterview> => {
    const response = await api.post(`/ai/interview/${interviewId}/start`);
    return response.data;
  },

  evaluateAnswer: async (data: {
    interviewId: string;
    questionId: string;
    answer: string;
    criteria: string;
  }): Promise<AIResponse> => {
    const response = await api.post('/ai/interview/evaluate', data);
    return response.data;
  },

  closeInterview: async (interviewId: string): Promise<{ id: string; status: string }> => {
    const response = await api.post(`/ai/interview/${interviewId}/close`);
    return response.data;
  },

  getResults: async (interviewId: string): Promise<AIResponse[]> => {
    const response = await api.get(`/ai/interview/${interviewId}/results`);
    return response.data;
  },
};
