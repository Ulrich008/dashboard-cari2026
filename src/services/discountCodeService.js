import api from './api';

export const discountCodeService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/discount-codes', { params });
    if (params.page) {
      return response.data;
    }
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/discount-codes/${id}`);
    return response.data.data || response.data;
  },

  create: async (data) => {
    const response = await api.post('/admin/discount-codes', data);
    return response.data.data || response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/admin/discount-codes/${id}`, data);
    return response.data.data || response.data;
  },

  deactivate: async (id) => {
    const response = await api.delete(`/admin/discount-codes/${id}`);
    return response.data;
  },

  activate: async (id) => {
    const response = await api.put(`/admin/discount-codes/${id}/activate`);
    return response.data.data || response.data;
  },

  getUsageHistory: async (id, params = {}) => {
    const response = await api.get(`/admin/discount-codes/${id}/usage`, { params });
    return response.data;
  },
};
