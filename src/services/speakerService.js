import api from './api';

export const speakerService = {
  // Récupérer tous les speakers
  getAll: async (params = {}) => {
    const response = await api.get('/admin/speakers', { params });
    return response.data.data || response.data;
  },

  // Récupérer un speaker par ID
  getById: async (id) => {
    const response = await api.get(`/admin/speakers/${id}`);
    return response.data.data || response.data;
  },

  // Créer un speaker
  create: async (data) => {
    const response = await api.post('/admin/speakers', data);
    return response.data.data || response.data;
  },

  // Mettre à jour un speaker
  update: async (id, data) => {
    const response = await api.put(`/admin/speakers/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un speaker
  delete: async (id) => {
    const response = await api.delete(`/admin/speakers/${id}`);
    return response.data.data || response.data;
  },
};
