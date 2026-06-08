import api from './api';

export const evenementService = {
  // Récupérer tous les événements
  getAll: async (params = {}) => {
    const response = await api.get('/admin/evenements', { params });
    return response.data.data || response.data;
  },

  // Récupérer un événement par ID
  getById: async (id) => {
    const response = await api.get(`/admin/evenements/${id}`);
    return response.data.data || response.data;
  },

  // Créer un événement
  create: async (data) => {
    const response = await api.post('/admin/evenements', data);
    return response.data.data || response.data;
  },

  // Mettre à jour un événement
  update: async (id, data) => {
    const response = await api.put(`/admin/evenements/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un événement
  delete: async (id) => {
    const response = await api.delete(`/admin/evenements/${id}`);
    return response.data;
  },
};
