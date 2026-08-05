import api from './api';

export const papierService = {
  // Récupérer tous les papiers
  getAll: async (params = {}) => {
    const response = await api.get('/admin/papiers', { params });
    if (params.page || params.paginated) {
      return response.data;
    }
    return response.data.data || response.data;
  },

  // Récupérer un papier par ID
  getById: async (id) => {
    const response = await api.get(`/admin/papiers/${id}`);
    return response.data.data || response.data;
  },

  // Mettre à jour un papier
  update: async (id, data) => {
    const response = await api.put(`/admin/papiers/${id}`, data);
    return response.data.data || response.data;
  },

  // Supprimer un papier (désactivation, activated=false)
  delete: async (id) => {
    const response = await api.delete(`/admin/papiers/${id}`);
    return response.data.data || response.data;
  },

  // Importer des papiers acceptés depuis un fichier markdown/texte
  importMarkdownPapers: async (formData) => {
    const response = await api.post('/admin/papiers/import-markdown', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Importer des papiers acceptés depuis un fichier CSV ou Excel (même format que le Markdown)
  importTableurPapers: async (formData) => {
    const response = await api.post('/admin/papiers/import-tableur', formData, {
      headers: { 'Content-Type': undefined }, // Axios génère le boundary multipart automatiquement
    });
    return response.data;
  },
};
