import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.data.access_token) {
      localStorage.setItem('kisanbazar_token', response.data.access_token);
      localStorage.setItem('kisanbazar_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('kisanbazar_token', response.data.access_token);
      localStorage.setItem('kisanbazar_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    if (response.data) {
      localStorage.setItem('kisanbazar_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/auth/me', data);
    if (response.data) {
      localStorage.setItem('kisanbazar_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('kisanbazar_token');
    localStorage.removeItem('kisanbazar_user');
  },

  getStoredUser() {
    try {
      const user = localStorage.getItem('kisanbazar_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('kisanbazar_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('kisanbazar_token');
  },
};

export default authService;
