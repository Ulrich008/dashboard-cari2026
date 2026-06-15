import api from './api';

const menuService = {
  getAll:   ()         => api.get('/admin/menus'),
  getById:  (id)       => api.get(`/admin/menus/${id}`),
  create:   (data)     => api.post('/admin/menus', data),
  update:   (id, data) => api.put(`/admin/menus/${id}`, data),
  toggle:   (id)       => api.patch(`/admin/menus/${id}/toggle`),
};

export default menuService;
