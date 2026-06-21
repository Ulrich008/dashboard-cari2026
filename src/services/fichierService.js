import api from './api';

const fichierService = {
  upload: async (file, contexte) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contexte', contexte);
    // Content-Type: undefined → Axios détecte FormData et définit multipart/form-data + boundary
    const response = await api.post('/admin/fichiers/upload', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data.data || response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/admin/fichiers', { params });
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/fichiers/${id}`);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/fichiers/${id}`);
    return response.data;
  },
};

export default fichierService;
