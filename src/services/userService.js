import api from './api';

export const userService = {
  // Récupérer tous les utilisateurs
  getAll: async (params = {}) => {
    const response = await api.get('/admin/admins', { params });
    return response.data.data || response.data;
  },

  // Récupérer un utilisateur par ID
  getById: async (id) => {
    const response = await api.get(`/admin/admins/${id}`);
    return response.data.data || response.data;
  },

  // Créer un utilisateur
  create: async (data) => {
    const response = await api.post('/admin/admins', data);
    return response.data.data || response.data;
  },

  // Mettre à jour un utilisateur
  update: async (id, data) => {
    const response = await api.put(`/admin/admins/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    const response = await api.delete(`/admin/admins/${id}`);
    return response.data.data || response.data;
  },
};
