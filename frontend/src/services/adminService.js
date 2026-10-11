import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getUsers(role = null) {
    const params = role ? { role } : {};
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUser(userId, data) {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  async getProducts() {
    const response = await api.get('/admin/products');
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/admin/orders');
    return response.data;
  },
};

export default adminService;
