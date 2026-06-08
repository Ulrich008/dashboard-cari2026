import api from './api';

export const programmeService = {
  // Récupérer tous les programmes
  getAll: async (params = {}) => {
    const response = await api.get('/admin/programme', { params });
    return response.data.data || response.data;
  },

  // Récupérer un programme par ID
  getById: async (id) => {
    const response = await api.get(`/admin/programme/${id}`);
    return response.data.data || response.data;
  },

  // Créer un programme
  create: async (data) => {
    const response = await api.post('/admin/programme', data);
    return response.data.data || response.data;
  },

  // Mettre à jour un programme
  update: async (id, data) => {
    const response = await api.put(`/admin/programme/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un programme (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/admin/programme/${id}`);
    return response.data;
  },
};
