import axios from 'axios';

// Get the API URL based on environment
const getApiUrl = () => {
  // Check if we're in development or production
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  }
  // Production
  return process.env.REACT_APP_API_URL || 'https://keepy.se/api';
};

const apiUrl = getApiUrl();

// Create and configure the axios instance
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Important for cookies if you use them
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication methods
const apiService = {
  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Login
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  async logout() {
    await api.post('/auth/logout');
  },

  // Refresh token
  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Admin dashboard methods
  async getAdminDashboardOverview() {
    const response = await api.get('/dashboard/admin/overview');
    return response.data;
  },

  async getAdminUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Alias for getAdminUsers for UserManagement component
  async getUsers() {
    return this.getAdminUsers();
  },

  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  async updateUser(userId, userData) {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Business methods
  async getAllBusinesses() {
    const response = await api.get('/businesses/');
    return response.data;
  },

  async getBusiness(businessId: string) {
    const response = await api.get(`/businesses/${businessId}`);
    return response.data;
  },

  async createBusiness(businessData: any) {
    const response = await api.post('/businesses/', businessData);
    return response.data;
  },

  async updateBusiness(businessId: string, businessData: any) {
    const response = await api.put(`/businesses/${businessId}`, businessData);
    return response.data;
  },

  async deleteBusiness(businessId: string) {
    const response = await api.delete(`/businesses/${businessId}`);
    return response.data;
  },

  // Customer methods
  async getCustomers(businessId?: string) {
    const url = businessId ? `/customers?business_id=${businessId}` : '/customers';
    const response = await api.get(url);
    return response.data;
  },

  async createCustomer(customerData: any) {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  async updateCustomer(customerId: string, customerData: any) {
    const response = await api.put(`/customers/${customerId}`, customerData);
    return response.data;
  },

  async deleteCustomer(customerId: string) {
    const response = await api.delete(`/customers/${customerId}`);
    return response.data;
  },

  // Dashboard methods
  async getDashboardData(businessId: string) {
    const response = await api.get(`/dashboard/${businessId}`);
    return response.data;
  },

  // Analytics methods
  async getAnalyticsData(businessId: string, period?: string) {
    const url = period ? `/analytics?business_id=${businessId}&period=${period}` : `/analytics?business_id=${businessId}`;
    const response = await api.get(url);
    return response.data;
  },

  // SMS methods
  async getSmsSettings(businessId: string) {
    const response = await api.get(`/sms/settings/${businessId}`);
    return response.data;
  },

  async updateSmsSettings(businessId: string, settings: any) {
    const response = await api.put(`/sms/settings/${businessId}`, settings);
    return response.data;
  },

  async sendSms(smsData: any) {
    const response = await api.post('/sms/send', smsData);
    return response.data;
  },

  // Import/Export methods
  async importCustomers(file: File, businessId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('business_id', businessId);
    const response = await api.post('/customers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async exportCustomers(businessId: string, format?: string) {
    const url = format ? `/customers/export?business_id=${businessId}&format=${format}` : `/customers/export?business_id=${businessId}`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  },

  // Price list methods
  async getPriceList(businessId: string) {
    const response = await api.get(`/price-list/${businessId}`);
    return response.data;
  },

  async updatePriceList(businessId: string, services: any[]) {
    const response = await api.put(`/price-list/${businessId}`, { services });
    return response.data;
  }
};

// Export both the raw axios instance and the service
export default apiService;
export { api, apiService };
