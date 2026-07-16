import api from './api';

export const backupService = {
  // Récupérer l'historique des sauvegardes (paginé)
  getAll: async (params = {}) => {
    const response = await api.get('/admin/backups', { params });
    return response.data;
  },

  // Déclencher une sauvegarde manuelle (super-admin uniquement).
  // modules: tableau de clés de config('backup.modules') pour cibler un ou plusieurs
  // modules, ou null/vide/omis pour une sauvegarde complète.
  create: async (modules = null) => {
    const response = await api.post('/admin/backups', { modules });
    return response.data;
  },

  // Exporter (télécharger) une sauvegarde
  download: async (id, filename) => {
    const response = await api.get(`/admin/backups/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `backup-${id}.dump`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Importer un fichier de sauvegarde externe (devient restaurable ensuite)
  import: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/backups/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },

  // Déclencher la restauration d'une sauvegarde ({ scope: 'full'|'partial', modules?: string[] })
  restore: async (backupId, payload) => {
    const response = await api.post(`/admin/backups/${backupId}/restore`, payload);
    return response.data;
  },

  // Statut d'une restauration (cible de polling)
  getRestoreStatus: async (id) => {
    const response = await api.get(`/admin/restores/${id}`);
    return response.data;
  },

  // Historique des restaurations (paginé)
  getRestoreHistory: async (params = {}) => {
    const response = await api.get('/admin/restores', { params });
    return response.data;
  },
};
