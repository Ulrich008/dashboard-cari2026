import api from './api';

export const participantService = {
  // Récupérer tous les participants
  getAll: async (params) => {
    const response = await api.get('/admin/participants', { params });
    if (params && (params.page || params.per_page)) {
      return response.data;
    }
    return response.data.data || response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/participants/stats');
    return response.data;
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

  // Déverrouiller / reverrouiller manuellement la page MyInfo (motif obligatoire)
  toggleMyInfoUnlock: async (id, unlocked, motif) => {
    const response = await api.put(`/admin/participants/${id}/myinfo-unlock`, { unlocked, motif });
    return response.data.data || response.data;
  },

  // Importer des auteurs
  importAuthors: async (data) => {
    const response = await api.post('/admin/participants/import-authors', data);
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
