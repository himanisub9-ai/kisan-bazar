import api from './api';

export const farmerService = {
  async getFarmers() {
    const response = await api.get('/farmers');
    return response.data;
  },

  async getFarmerDetails(farmerId) {
    const response = await api.get(`/farmers/${farmerId}`);
    return response.data;
  },

  async getFarmerProducts(farmerId) {
    const response = await api.get(`/farmers/${farmerId}/products`);
    return response.data;
  },

  async getFarmerDashboardStats() {
    const response = await api.get('/farmers/dashboard/stats');
    return response.data;
  },
};

export default farmerService;
