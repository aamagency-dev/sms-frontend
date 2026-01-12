import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

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

  const [serviceIntervals, setServiceIntervals] = useState<ServiceInterval[]>([
    { service_name: "Men's Haircut", interval_months: 1.5, template: 'quick_cut' },
    { service_name: "Women's Haircut", interval_months: 2, template: 'standard' },
    { service_name: "Hair Coloring", interval_months: 2.5, template: 'color_care' },
    { service_name: "Beard Trim", interval_months: 1, template: 'beard_care' },
    { service_name: "Styling", interval_months: 1.5, template: 'style_maintain' },
    { service_name: "Treatment", interval_months: 3, template: 'treatment_followup' }
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, [businessId]);

  const loadSettings = async () => {
    try {
      const response = await apiService.get(`/api/businesses/${businessId}`);
      const business = response.data;
      
      if (business.sms_settings) {
        setSettings(business.sms_settings);
      }
      
      if (business.service_intervals) {
        const intervals = Object.entries(business.service_intervals).map(([name, config]: [string, any]) => ({
          service_name: name,
          interval_months: config.interval_months,
          template: config.template
        }));
        setServiceIntervals(intervals);
      }
    } catch (error) {
      console.error('Error loading SMS settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Convert service intervals back to object format
      const intervalsObject: { [key: string]: any } = {};
      serviceIntervals.forEach(interval => {
        intervalsObject[interval.service_name] = {
          interval_months: interval.interval_months,
          template: interval.template
        };
      });

      await apiService.put(`/api/businesses/${businessId}`, {
        sms_settings: settings,
        service_intervals: intervalsObject
      });

      setMessage({ type: 'success', text: 'SMS settings saved successfully!' });
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

  const updateServiceInterval = (index: number, field: keyof ServiceInterval, value: string | number) => {
    const updated = [...serviceIntervals];
    updated[index] = { ...updated[index], [field]: value };
    setServiceIntervals(updated);
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interval (months)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {serviceIntervals.map((interval, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {interval.service_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="12"
                      value={interval.interval_months}
                      onChange={(e) => updateServiceInterval(index, 'interval_months', parseFloat(e.target.value))}
                      className="w-20 border-gray-300 rounded-md shadow-sm p-1 border"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={interval.template}
                      onChange={(e) => updateServiceInterval(index, 'template', e.target.value)}
                      className="border-gray-300 rounded-md shadow-sm p-1 border"
                    >
                      <option value="quick_cut">Quick Cut</option>
                      <option value="standard">Standard</option>
                      <option value="color_care">Color Care</option>
                      <option value="beard_care">Beard Care</option>
                      <option value="style_maintain">Style Maintain</option>
                      <option value="treatment_followup">Treatment Follow-up</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Message types:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Quick Cut: Short, punchy messages for frequent services</li>
            <li>Standard: General appointment reminders</li>
            <li>Color Care: Focus on maintaining color treatments</li>
            <li>Beard Care: Beard maintenance reminders</li>
            <li>Style Maintain: Style preservation tips</li>
            <li>Treatment Follow-up: Post-treatment care messages</li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SMSSettings;
