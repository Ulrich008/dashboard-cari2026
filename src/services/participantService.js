import api from './api';

export const participantService = {
  // Récupérer tous les participants
  getAll: async () => {
    const response = await api.get('/admin/participants');
    return response.data.data || response.data;
  },

  // Récupérer un participant par ID
  getById: async (id) => {
    const response = await api.get(`/admin/participants/${id}`);
    return response.data.data || response.data;
  },

  // Mettre à jour un participant
  update: async (id, data) => {
    const response = await api.put(`/admin/participants/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un participant
  delete: async (id) => {
    const response = await api.delete(`/admin/participants/${id}`);
    return response.data.data || response.data;
  },

  // Activer un participant
  activate: async (id) => {
    const response = await api.put(`/admin/participants/${id}/activate`);
    return response.data.data || response.data;
  },

  // Importer des auteurs
  importAuthors: async (data) => {
    const response = await api.post('/admin/participants/import-authors', data);
    return response.data.data || response.data;
  },
};
