import api from './api';

export const authService = {
  // Connexion admin
  login: async (credentials) => {
    const response = await api.post('/admin/auth/login', credentials);
    console.log('Login API response:', response.data);
    // La réponse est imbriquée dans un objet "data"
    const data = response.data.data || response.data;
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    return data;
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.post('/admin/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  // Rafraîchir le token
  refreshToken: async () => {
    const response = await api.post('/admin/auth/refresh');
    const data = response.data.data || response.data;
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    return data;
  },

  // Obtenir les infos de l'utilisateur connecté
  me: async () => {
    const response = await api.get('/admin/auth/me');
    return response.data.data || response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (data) => {
    const response = await api.put('/admin/auth/me', data);
    return response.data.data || response.data;
  },

  // Mot de passe oublié
  forgotPassword: async (email) => {
    const response = await api.post('/admin/auth/forgot-password', { email });
    return response.data.data || response.data;
  },

  // Réinitialiser le mot de passe
  resetPassword: async (data) => {
    const response = await api.post('/admin/auth/reset-password', data);
    return response.data.data || response.data;
  },

  // Changer le mot de passe
  changePassword: async (data) => {
    const response = await api.post('/admin/auth/change-password', data);
    return response.data.data || response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
