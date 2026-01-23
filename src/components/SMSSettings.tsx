import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { serviceRetentionApi, SERVICE_CATEGORIES, formatInterval, parseInterval } from '../services/serviceRetentionApi';

interface SMSSettings {
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
}

interface ServiceInterval {
  service_name: string;
  interval_months: number;
  template: string;
}

const SMSSettings: React.FC<{ businessId: string }> = ({ businessId }) => {
  const [settings, setSettings] = useState<SMSSettings>({
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
  });

  const [serviceIntervals, setServiceIntervals] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState(SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, [businessId]);

  const loadSettings = async () => {
    try {
      // Load service intervals from API
      const intervals = await serviceRetentionApi.getIntervals(businessId);
      setServiceIntervals(intervals);

      // Load categories
      const cats = await serviceRetentionApi.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Save each service interval using the API
      for (const [category, services] of Object.entries(serviceIntervals)) {
        for (const service of services) {
          await serviceRetentionApi.updateInterval(
            businessId,
            service.service_name,
            service.interval_months
          );
        }
      }

      setMessage({ type: 'success', text: 'Service intervals saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updatePostAppointmentSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      post_appointment: {
        ...prev.post_appointment,
        [key]: value
      }
    }));
  };

  const updateServiceInterval = (category: string, serviceName: string, intervalMonths: number) => {
    setServiceIntervals(prev => ({
      ...prev,
      [category]: prev[category]?.map(service => 
        service.service_name === serviceName 
          ? { ...service, interval_months: intervalMonths }
          : service
      ) || []
    }));
  };

  if (loading) {
    return <div className="p-6">Loading SMS settings...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Post-Appointment SMS Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Post-Appointment SMS</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sms_enabled"
              checked={settings.post_appointment.enabled}
              onChange={(e) => updatePostAppointmentSetting('enabled', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="sms_enabled" className="ml-2 block text-sm text-gray-900">
              Enable post-appointment SMS
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Send after (hours): {settings.post_appointment.delay_hours}
            </label>
            <input
              type="range"
              min="1"
              max="72"
              value={settings.post_appointment.delay_hours}
              onChange={(e) => updatePostAppointmentSetting('delay_hours', parseInt(e.target.value))}
              className="mt-1 block w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 hour</span>
              <span>72 hours</span>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="business_hours"
              checked={settings.post_appointment.business_hours_only}
              onChange={(e) => updatePostAppointmentSetting('business_hours_only', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="business_hours" className="ml-2 block text-sm text-gray-900">
              Only send during business hours
            </label>
          </div>

          {settings.post_appointment.business_hours_only && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start time</label>
                <input
                  type="time"
                  value={settings.post_appointment.send_start_time}
                  onChange={(e) => updatePostAppointmentSetting('send_start_time', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End time</label>
                <input
                  type="time"
                  value={settings.post_appointment.send_end_time}
                  onChange={(e) => updatePostAppointmentSetting('send_end_time', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="skip_weekends"
              checked={settings.post_appointment.skip_weekends}
              onChange={(e) => updatePostAppointmentSetting('skip_weekends', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="skip_weekends" className="ml-2 block text-sm text-gray-900">
              Skip weekends
            </label>
          </div>
        </div>
      </div>

      {/* Service-Based Retention Intervals */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Retention Intervals</h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure how often to send retention SMS for different services
        </p>

        <div className="overflow-x-auto">
          {Object.entries(categories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interval
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serviceIntervals[categoryKey]?.map((service: any) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.service_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="12"
                          value={service.interval_months}
                          onChange={(e) => {
                            const value = parseInterval(e.target.value);
                            if (value !== null) {
                              updateServiceInterval(categoryKey, service.service_name, value);
                            }
                          }}
                          className="w-24 border-gray-300 rounded-md shadow-sm p-2 border"
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          {formatInterval(service.interval_months)}
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-sm text-gray-500 text-center">
                        No services configured for this category
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Intervals determine when customers receive follow-up SMS after their last visit.</p>
          <p className="mt-1">For example: 1.5 months = approximately every 6 weeks</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SMSSettings;
