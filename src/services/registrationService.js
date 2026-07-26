import api from './api';

export const registrationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/registrations', { params });
    if (params.page) {
      return response.data;
    }
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/registrations/${id}`);
    return response.data.data || response.data;
  },

  changePaymentStatus: async (id, statut_paiement, motif) => {
    const response = await api.post(`/admin/registrations/${id}/change-payment-status`, { statut_paiement, motif });
    return response.data.data || response.data;
  },

  editAmount: async (id, { montant_total, montant_reduit, motif }) => {
    const response = await api.post(`/admin/registrations/${id}/edit-amount`, { montant_total, montant_reduit, motif });
    return response.data.data || response.data;
  },

  applyDiscount: async (id, discount_code, motif) => {
    const response = await api.post(`/admin/registrations/${id}/apply-discount`, { discount_code, motif });
    return response.data.data || response.data;
  },

  removeDiscount: async (id, motif) => {
    const response = await api.post(`/admin/registrations/${id}/remove-discount`, { motif });
    return response.data.data || response.data;
  },

  checkIn: async (id) => {
    const response = await api.post(`/admin/registrations/${id}/check-in`);
    return response.data.data || response.data;
  },

  cancelCheckIn: async (id, motif) => {
    const response = await api.post(`/admin/registrations/${id}/cancel-checkin`, { motif });
    return response.data.data || response.data;
  },

  generateBadge: async (id) => {
    const response = await api.post(`/admin/registrations/${id}/badge`);
    return response.data.data || response.data;
  },

  getAuditHistory: async (id) => {
    const response = await api.get('/admin/logs/audit', { params: { entity_type: 'registration', entity_id: id } });
    return response.data.data || response.data;
  },
};
