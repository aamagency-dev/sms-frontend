import React, { useState, useEffect } from 'react';
import { SERVICE_CATEGORIES } from '../services/serviceRetentionApi';
import { Business } from '../types';

interface BusinessFormProps {
  onSubmit: (businessData: BusinessFormData) => void;
  onCancel: () => void;
  initialData?: Partial<Business>;
  loading?: boolean;
}

export interface BusinessFormData {
  name: string;
  slug: string;
  contact_phone?: string;
  contact_email?: string;
  twilio_phone_number?: string;
  google_review_link?: string;
  inactive_customer_days: number;
  // New SMS settings structure - not optional for form state
  sms_settings: {
    post_appointment: {
      enabled: boolean;
      delay_hours: number;
      business_hours_only: boolean;
      skip_weekends: boolean;
      send_start_time: string;
      send_end_time: string;
    };
    retention: {
      enabled: boolean;
      default_interval_months: number;
    };
  };
  service_intervals: {
    [serviceName: string]: {
      interval_months: number;
      template: string;
    };
  };
  bokadirekt_webhook_secret?: string;
  bokadirekt_location_id?: string;
  priceListFile?: File;
}

const BusinessForm: React.FC<BusinessFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    contact_phone: initialData?.contact_phone || '',
    contact_email: initialData?.contact_email || '',
    twilio_phone_number: initialData?.twilio_phone_number || '',
    google_review_link: initialData?.google_review_link || '',
    inactive_customer_days: initialData?.inactive_customer_days || 90,
    // New SMS settings with defaults - always present
    sms_settings: initialData?.sms_settings || {
      post_appointment: {
        enabled: true,
        delay_hours: 20,
        business_hours_only: true,
        skip_weekends: false,
        send_start_time: '09:00',
        send_end_time: '18:00'
      },
      retention: {
        enabled: true,
        default_interval_months: 3
      }
    },
    service_intervals: initialData?.service_intervals || Object.fromEntries(
  Object.entries(SERVICE_CATEGORIES).map(([key, category]) => [
    category.name,
    { interval_months: category.defaultInterval, template: 'standard' }
  ])
),
    bokadirekt_webhook_secret: initialData?.bokadirekt_webhook_secret || '',
    bokadirekt_location_id: initialData?.bokadirekt_location_id || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [priceListFile, setPriceListFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.startsWith('sms_settings.')) {
        const path = name.split('.');
        setFormData(prev => ({
          ...prev,
          sms_settings: {
            ...prev.sms_settings,
            [path[1]]: {
              ...prev.sms_settings[path[1] as keyof typeof prev.sms_settings],
              [path[2]]: checkbox.checked
            }
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
      }
    } else if (name.startsWith('sms_settings.')) {
      const path = name.split('.');
      setFormData(prev => ({
        ...prev,
        sms_settings: {
          ...prev.sms_settings,
          [path[1]]: {
            ...prev.sms_settings[path[1] as keyof typeof prev.sms_settings],
            [path[2]]: type === 'number' ? parseFloat(value) || 0 : value
          }
        }
      }));
    } else if (name.startsWith('service_interval.')) {
      const [_, serviceName, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        service_intervals: {
          ...prev.service_intervals,
          [serviceName]: {
            ...prev.service_intervals[serviceName],
            [field]: field === 'interval_months' ? parseFloat(value) || 0 : value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (formData.inactive_customer_days < 30 || formData.inactive_customer_days > 365) {
      newErrors.inactive_customer_days = 'Must be between 30 and 365 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Include both new and old settings for backward compatibility
      const submitData = {
        ...formData,
        sms_settings: formData.sms_settings,
        service_intervals: formData.service_intervals,
        priceListFile: priceListFile || undefined
      };
      onSubmit(submitData);
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setFormData({ ...formData, slug });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Business Name *
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-purple-500 focus:ring-purple-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              placeholder="e.g., Awesome Salon"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              Generate Slug
            </button>
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            URL Slug *
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            value={formData.slug}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            placeholder="e.g., awesome-salon"
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
          )}
        </div>

        <div>
          <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
            Contact Phone
          </label>
          <input
            type="tel"
            name="contact_phone"
            id="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            placeholder="+46 70 123 45 67"
          />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
            Contact Email
          </label>
          <input
            type="email"
            name="contact_email"
            id="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            placeholder="contact@salon.com"
          />
        </div>

        <div>
          <label htmlFor="twilio_phone_number" className="block text-sm font-medium text-gray-700">
            Twilio Phone Number
          </label>
          <input
            type="tel"
            name="twilio_phone_number"
            id="twilio_phone_number"
            value={formData.twilio_phone_number}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            placeholder="+46123456789"
          />
          <p className="mt-1 text-sm text-gray-500">
            Phone number for sending SMS messages
          </p>
        </div>

        <div>
          <label htmlFor="google_review_link" className="block text-sm font-medium text-gray-700">
            Google Review Link
          </label>
          <input
            type="url"
            name="google_review_link"
            id="google_review_link"
            value={formData.google_review_link}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            placeholder="https://g.page/your-salon/review"
          />
          <p className="mt-1 text-sm text-gray-500">
            Link to your Google Business profile for reviews
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Settings</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Post-Appointment SMS</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="sms_settings.post_appointment.enabled"
                  id="sms_enabled"
                  checked={formData.sms_settings?.post_appointment?.enabled || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="sms_enabled" className="ml-2 block text-sm text-gray-900">
                  Enable post-appointment SMS
                </label>
              </div>

              <div>
                <label htmlFor="delay_hours" className="block text-sm font-medium text-gray-700">
                  Send after (hours)
                </label>
                <input
                  type="number"
                  name="sms_settings.post_appointment.delay_hours"
                  id="delay_hours"
                  min="1"
                  max="72"
                  value={formData.sms_settings?.post_appointment?.delay_hours || 20}
                  onChange={handleChange}
                  className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Hours after appointment to send SMS (1-72)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="sms_settings.post_appointment.business_hours_only"
                  id="business_hours_only"
                  checked={formData.sms_settings?.post_appointment?.business_hours_only || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="business_hours_only" className="ml-2 block text-sm text-gray-900">
                  Only send during business hours
                </label>
              </div>

              {formData.sms_settings?.post_appointment?.business_hours_only && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label htmlFor="send_start_time" className="block text-sm font-medium text-gray-700">
                      Start time
                    </label>
                    <input
                      type="time"
                      name="sms_settings.post_appointment.send_start_time"
                      id="send_start_time"
                      value={formData.sms_settings?.post_appointment?.send_start_time || '09:00'}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="send_end_time" className="block text-sm font-medium text-gray-700">
                      End time
                    </label>
                    <input
                      type="time"
                      name="sms_settings.post_appointment.send_end_time"
                      id="send_end_time"
                      value={formData.sms_settings?.post_appointment?.send_end_time || '18:00'}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="sms_settings.post_appointment.skip_weekends"
                  id="skip_weekends"
                  checked={formData.sms_settings?.post_appointment?.skip_weekends || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="skip_weekends" className="ml-2 block text-sm text-gray-900">
                  Skip weekends
                </label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Service Retention Intervals</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Configure how often to send follow-up SMS for different services
              </p>
              <div className="space-y-4">
                {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => {
                  const serviceName = category.name;
                  const config = formData.service_intervals?.[serviceName] || { interval_months: category.defaultInterval, template: 'standard' };
                  return (
                    <div key={key} className="grid grid-cols-2 gap-4 items-center">
                      <label className="text-sm text-gray-700 flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        {serviceName}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          name={`service_interval.${serviceName}.interval_months`}
                          step="0.5"
                          min="0.5"
                          max="12"
                          value={config.interval_months}
                          onChange={handleChange}
                          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
                        />
                        <span className="text-sm text-gray-500">months</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inactive Customer Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="inactive_customer_days" className="block text-sm font-medium text-gray-700">
              Inactive After (days)
            </label>
            <input
              type="number"
              name="inactive_customer_days"
              id="inactive_customer_days"
              min="30"
              max="365"
              value={formData.inactive_customer_days}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            />
            <p className="mt-1 text-sm text-gray-500">
              Days without visit before customer is considered inactive
            </p>
            {errors.inactive_customer_days && (
              <p className="mt-1 text-sm text-red-600">{errors.inactive_customer_days}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Configuration</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="bokadirekt_webhook_secret" className="block text-sm font-medium text-gray-700">
              Boka Direkt Webhook Secret
            </label>
            <input
              type="password"
              name="bokadirekt_webhook_secret"
              id="bokadirekt_webhook_secret"
              value={formData.bokadirekt_webhook_secret || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
              placeholder="Enter webhook secret for Boka Direkt integration"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional: Secret key for validating webhook requests from Boka Direkt
            </p>
          </div>
          
          <div>
            <label htmlFor="bokadirekt_location_id" className="block text-sm font-medium text-gray-700">
              Boka Direkt Location ID
            </label>
            <input
              type="text"
              name="bokadirekt_location_id"
              id="bokadirekt_location_id"
              value={formData.bokadirekt_location_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
              placeholder="Enter your Boka Direkt location ID"
            />
            <p className="mt-1 text-sm text-gray-500">
              Required: Your location ID from Boka Direkt for webhook processing
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Webhook URL for Boka Direkt</h4>
            <p className="text-sm text-blue-700 mb-2">
              Use this URL in your Boka Direkt webhook configuration:
            </p>
            <code className="text-xs bg-blue-100 px-2 py-1 rounded break-all">
              {window.location.origin}/api/webhooks/bokadirekt
            </code>
            <p className="text-sm text-blue-600 mt-2">
              Make sure to include the webhook secret above if required by Boka Direkt
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (initialData?.id ? 'Update Business' : 'Create Business')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BusinessForm;
