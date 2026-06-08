import api from './api';

export const pageService = {
  // Récupérer toutes les pages
  getAll: async (params = {}) => {
    const response = await api.get('/admin/pages', { params });
    return response.data.data || response.data;
  },

  // Récupérer une page par ID
  getById: async (id) => {
    const response = await api.get(`/admin/pages/${id}`);
    return response.data.data || response.data;
  },

  // Créer une page
  create: async (data) => {
    const response = await api.post('/admin/pages', data);
    return response.data.data || response.data;
  },

  // Mettre à jour une page
  update: async (id, data) => {
    const response = await api.put(`/admin/pages/${id}`, data);
    return response.data.data || response.data;
  },

  // Publier une page
  publish: async (id) => {
    const response = await api.post(`/admin/pages/${id}/publish`);
    return response.data.data || response.data;
  },

  // Supprimer une page
  delete: async (id) => {
    const response = await api.delete(`/admin/pages/${id}`);
    return response.data.data || response.data;
  },
};
