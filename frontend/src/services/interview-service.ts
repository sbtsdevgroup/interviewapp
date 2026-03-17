import api from '@/utils/axios-client';

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
