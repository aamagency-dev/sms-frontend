import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardOverview() {
    const response = await this.api.get('/dashboard/overview');
    return response.data;
  }

  async getAdminDashboardOverview() {
    const response = await this.api.get('/dashboard/admin/overview');
    return response.data;
  }

  async getRecentCustomers(limit: number = 10) {
    const response = await this.api.get(`/dashboard/customers/recent?limit=${limit}`);
    return response.data;
  }

  async getInactiveCustomers(months: number = 3) {
    const response = await this.api.get(`/dashboard/customers/inactive?months=${months}`);
    return response.data;
  }

  async getScheduledSms() {
    const response = await this.api.get('/dashboard/sms/scheduled');
    return response.data;
  }

  async getSmsHistory(days: number = 30) {
    const response = await this.api.get(`/dashboard/sms/history?days=${days}`);
    return response.data;
  }

  async getRetentionStats(months: number = 12) {
    const response = await this.api.get(`/dashboard/stats/retention?months=${months}`);
    return response.data;
  }

  async cancelScheduledSms(smsId: string) {
    const response = await this.api.post(`/dashboard/sms/cancel/${smsId}`);
    return response.data;
  }

  // SMS sending endpoints
  async getBusinessCustomers(businessId: string) {
    const response = await this.api.get(`/businesses/${businessId}/customers`);
    return response.data;
  }

  async sendBulkSms(data: {
    customer_ids: string[];
    message: string;
    business_id: string;
  }) {
    const response = await this.api.post('/sms/send-bulk', data);
    return response.data;
  }

  async sendSingleSms(data: {
    customer_id: string;
    message: string;
    business_id: string;
  }) {
    const response = await this.api.post('/sms/send', data);
    return response.data;
  }

  // Price list endpoints
  async importPriceList(formData: FormData) {
    const response = await this.api.post('/pricelist/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async exportPriceList(businessId: string) {
    const response = await this.api.get(`/pricelist/export?business_id=${businessId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getPriceList(businessId: string) {
    const response = await this.api.get(`/pricelist/${businessId}`);
    return response.data;
  }

  // Customer endpoints
  async getCustomers(params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await this.api.get('/customers/', { params });
    return response.data;
  }

  async getCustomer(customerId: string) {
    const response = await this.api.get(`/customers/${customerId}`);
    return response.data;
  }

  async createCustomer(customerData: any) {
    const response = await this.api.post('/customers/', customerData);
    return response.data;
  }

  async updateCustomer(customerId: string, customerData: any) {
    const response = await this.api.put(`/customers/${customerId}`, customerData);
    return response.data;
  }

  async deleteCustomer(customerId: string) {
    const response = await this.api.delete(`/customers/${customerId}`);
    return response.data;
  }

  async deleteBusiness(businessId: string) {
    const response = await this.api.delete(`/businesses/${businessId}`);
    return response.data;
  }

  // Analytics methods
  async getRetentionAnalytics(months: number = 12, businessId?: string) {
    const url = businessId 
      ? `/analytics/retention?months=${months}&business_id=${businessId}`
      : `/analytics/retention?months=${months}`;
    const response = await this.api.get(url);
    return response.data;
  }

  async getDashboardMetrics() {
    const response = await this.api.get('/analytics/dashboard');
    return response.data;
  }

  async getSatisfactionTrends(businessId?: string) {
    const url = businessId ? `/analytics/satisfaction-trends?business_id=${businessId}` : '/analytics/satisfaction-trends';
    const response = await this.api.get(url);
    return response.data;
  }

  // Admin endpoints
  async getAdminStats() {
    const response = await this.api.get('/admin/stats');
    return response.data;
  }

  // User management endpoints
  async getUsers() {
    try {
      const response = await this.api.get('/admin/users');
      return response.data;
    } catch (error: any) {
      console.error('Get users error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createUser(userData: {
    email: string;
    full_name: string;
    password: string;
    role: 'admin' | 'user';
    business_id?: string;
  }) {
    try {
      const response = await this.api.post('/admin/users', userData);
      return response.data;
    } catch (error: any) {
      console.error('Create user error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateUser(userId: string, userData: {
    full_name?: string;
    role?: 'admin' | 'user';
    business_id?: string;
    password?: string;
  }) {
    try {
      const response = await this.api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Update user error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const response = await this.api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete user error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Customer Import/Export endpoints
  async importCustomers(file: File, businessId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('business_id', businessId);
    
    const response = await this.api.post('/customers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async exportCustomers(businessId: string, startDate?: string, endDate?: string, visitStatus?: string) {
    const params: any = {
      business_id: businessId,
    };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (visitStatus) params.visit_status = visitStatus;
    
    const response = await this.api.get('/customers/export', {
      params,
      responseType: 'blob',
    });
    
    return response.data;
  }

  // Business endpoints
  async getAllBusinesses(params?: {
    skip?: number;
    limit?: number;
  }) {
    try {
      console.log('Fetching all businesses from /businesses/');
      const response = await this.api.get('/businesses/', { params });
      console.log('Businesses response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get all businesses error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createBusiness(businessData: any) {
    try {
      const response = await this.api.post('/businesses/', businessData);
      return response.data;
    } catch (error: any) {
      console.error('Create business error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBusiness(businessId: string) {
    const response = await this.api.get(`/businesses/${businessId}`);
    return response.data;
  }

  async updateBusiness(businessId: string, businessData: any) {
    const response = await this.api.put(`/businesses/${businessId}`, businessData);
    return response.data;
  }

  async addBusinessLocation(businessId: string, locationData: any) {
    const response = await this.api.post(`/businesses/${businessId}/locations`, locationData);
    return response.data;
  }

  async getBusinessLocations(businessId: string) {
    const response = await this.api.get(`/businesses/${businessId}/locations`);
    return response.data;
  }

  // Workflow endpoints
  async getWorkflows(businessId?: string) {
    const params = businessId ? { business_id: businessId } : {};
    const response = await this.api.get('/workflows/', { params });
    return response.data;
  }

  async getWorkflow(workflowId: string) {
    const response = await this.api.get(`/workflows/${workflowId}`);
    return response.data;
  }

  async createWorkflow(workflowData: any) {
    const response = await this.api.post('/workflows/', workflowData);
    return response.data;
  }

  async updateWorkflow(workflowId: string, workflowData: any) {
    const response = await this.api.put(`/workflows/${workflowId}`, workflowData);
    return response.data;
  }

  async deleteWorkflow(workflowId: string) {
    const response = await this.api.delete(`/workflows/${workflowId}`);
    return response.data;
  }

  // Generic methods
  async get(url: string) {
    const response = await this.api.get(url);
    return response;
  }

  async put(url: string, data: any) {
    const response = await this.api.put(url, data);
    return response;
  }

  async post(url: string, data: any) {
    const response = await this.api.post(url, data);
    return response;
  }

  async delete(url: string) {
    const response = await this.api.delete(url);
    return response;
  }
}

export const apiService = new ApiService();
export default apiService;
