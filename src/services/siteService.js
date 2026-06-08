import api from './api';

export const siteService = {
  // Récupérer les informations du site
  get: async () => {
    const response = await api.get('/site');
    return response.data.data || response.data;
  },

  // Mettre à jour les informations du site
  update: async (data) => {
    const response = await api.put('/site', data);
    return response.data.data || response.data;
  },
};
