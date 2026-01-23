// Service Retention Intervals API Service
import { api } from './api';

// Swedish service categories with icons and descriptions
export const SERVICE_CATEGORIES = {
  mens_hair: {
    name: 'Herklippning',
    description: 'Klippningstjänster för män',
    icon: '✂️',
    defaultInterval: 1.5
  },
  womens_hair: {
    name: 'Damklippning',
    description: 'Klippningstjänster för kvinnor',
    icon: '💇‍♀️',
    defaultInterval: 2.0
  },
  coloring: {
    name: 'Färgning',
    description: 'Hårfärg och slingor',
    icon: '🎨',
    defaultInterval: 2.5
  },
  beard: {
    name: 'Skägg',
    description: 'Skäggvård och trimning',
    icon: '🧔',
    defaultInterval: 1.0
  },
  styling: {
    name: 'Styling',
    description: 'Föning och uppstyling',
    icon: '✨',
    defaultInterval: 1.5
  },
  treatment: {
    name: 'Behandling',
    description: 'Hårkur och behandlingar',
    icon: '🌿',
    defaultInterval: 3.0
  }
};

export const serviceRetentionApi = {
  // Get all service categories
  async getCategories() {
    try {
      const response = await api.get('/businesses/service-categories');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      // Return default categories if API fails
      return SERVICE_CATEGORIES;
    }
  },

  // Get service intervals for a business
  async getIntervals(businessId) {
    try {
      const response = await api.get(`/businesses/service-intervals?business_id=${businessId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching service intervals:', error);
      return {};
    }
  },

  // Update a service interval
  async updateInterval(businessId, serviceName, intervalMonths) {
    try {
      const response = await api.put('/businesses/service-intervals', null, {
        params: {
          business_id: businessId,
          service_name: serviceName,
          interval_months: intervalMonths
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating service interval:', error);
      throw error;
    }
  },

  // Create a new service interval
  async createInterval(businessId, serviceData) {
    try {
      const response = await api.post('/businesses/service-intervals', serviceData, {
        params: { business_id: businessId }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating service interval:', error);
      throw error;
    }
  },

  // Delete a service interval
  async deleteInterval(intervalId) {
    try {
      const response = await api.delete(`/businesses/service-intervals/${intervalId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service interval:', error);
      throw error;
    }
  }
};

// Format interval for display
export const formatInterval = (months) => {
  if (months % 1 === 0) {
    return `${months} månader`;
  }
  return `${months} månader`;
};

// Parse interval from input
export const parseInterval = (value) => {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed < 0.5 || parsed > 12) {
    return null;
  }
  return parsed;
};
