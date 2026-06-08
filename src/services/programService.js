import api from './api';

export const programService = {
  // Récupérer tout le programme
  getAll: async () => {
    const response = await api.get('/admin/programme');
    return response.data.data || response.data;
  },

  // Récupérer un élément du programme par ID
  getById: async (id) => {
    const response = await api.get(`/admin/programme/${id}`);
    return response.data.data || response.data;
  },

  // Créer un élément du programme
  create: async (data) => {
    const response = await api.post('/admin/programme', data);
    return response.data.data || response.data;
  },

  // Mettre à jour un élément du programme
  update: async (id, data) => {
    const response = await api.put(`/admin/programme/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un élément du programme
  delete: async (id) => {
    const response = await api.delete(`/admin/programme/${id}`);
    return response.data.data || response.data;
  },
};
