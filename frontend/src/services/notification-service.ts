import api from '@/utils/axios-client';

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
