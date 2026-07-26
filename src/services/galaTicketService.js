import api from './api';

export const galaTicketService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/gala-tickets', { params });
    if (params.page) {
      return response.data;
    }
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/gala-tickets/${id}`);
    return response.data.data || response.data;
  },

  markPaid: async (id, motif) => {
    const response = await api.post(`/admin/gala-tickets/${id}/mark-paid`, { motif });
    return response.data.data || response.data;
  },
};
