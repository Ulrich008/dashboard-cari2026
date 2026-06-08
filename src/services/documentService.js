import api from './api';

export const documentService = {
  // Récupérer tous les documents
  getAll: async (params = {}) => {
    const response = await api.get('/admin/documents', { params });
    return response.data.data || response.data;
  },

  // Récupérer un document par ID
  getById: async (id) => {
    const response = await api.get(`/admin/documents/${id}`);
    return response.data.data || response.data;
  },

  // Créer un document
  create: async (data) => {
    const response = await api.post('/admin/documents', data);
    return response.data.data || response.data;
  },

  // Mettre à jour un document
  update: async (id, data) => {
    const response = await api.put(`/admin/documents/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un document
  delete: async (id) => {
    const response = await api.delete(`/admin/documents/${id}`);
    return response.data.data || response.data;
  },
};
