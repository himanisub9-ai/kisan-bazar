import api from './api';

export const orderService = {
  async placeOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(orderId, orderStatus) {
    const response = await api.put(`/orders/${orderId}/status`, {
      order_status: orderStatus,
    });
    return response.data;
  },

  async cancelOrder(orderId) {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },
};

export default orderService;
