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

  // Auteurs classés par événement (liste, statistiques, export)
  getAuthorsByEvent: async (evenementId) => {
    const response = await api.get('/admin/participants/authors', { params: { evenement_id: evenementId } });
    return response.data.data || response.data;
  },

  getAuthorStatistics: async (evenementId) => {
    const response = await api.get('/admin/participants/authors/statistics', { params: { evenement_id: evenementId } });
    return response.data.data || response.data;
  },

  exportAuthors: async (evenementId, format) => {
    const response = await api.get('/admin/participants/authors/export', {
      params: { evenement_id: evenementId, format },
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `auteurs.${format}`;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
