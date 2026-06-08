import api from './api';

export const sponsorService = {
  // Récupérer tous les sponsors
  getAll: async (params = {}) => {
    const response = await api.get('/admin/sponsors', { params });
    return response.data.data || response.data;
  },

  // Récupérer un sponsor par ID
  getById: async (id) => {
    const response = await api.get(`/admin/sponsors/${id}`);
    return response.data.data || response.data;
  },

  // Créer un sponsor
  create: async (data) => {
    const response = await api.post('/admin/sponsors', data);
    return response.data.data || response.data;
  },

  // Mettre à jour un sponsor
  update: async (id, data) => {
    const response = await api.put(`/admin/sponsors/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un sponsor
  delete: async (id) => {
    const response = await api.delete(`/admin/sponsors/${id}`);
    return response.data.data || response.data;
  },
};
