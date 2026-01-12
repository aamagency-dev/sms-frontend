import React, { useState } from 'react';
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
  google_review_link?: string; // Add Google review link field
  inactive_customer_days: number; // Add inactive customer days
  retention_months_new: number;
  retention_months_returning: number;
  retention_days_after_booking: number;
  sms_send_time_type: 'fixed' | 'random';
  sms_send_time?: string; // HH:MM format for fixed time
  sms_send_time_start?: string; // HH:MM format for random range start
  sms_send_time_end?: string; // HH:MM format for random range end
  bokadirekt_webhook_secret?: string; // Optional webhook secret for Boka Direkt
  priceListFile?: File; // Optional price list CSV file
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
    retention_months_new: initialData?.retention_months_new || 3,
    retention_months_returning: initialData?.retention_months_returning || 2,
    retention_days_after_booking: initialData?.retention_days_after_booking || 35,
    sms_send_time_type: initialData?.sms_send_time_type || 'random',
    sms_send_time: initialData?.sms_send_time || '14:00',
    sms_send_time_start: initialData?.sms_send_time_start || '13:00',
    sms_send_time_end: initialData?.sms_send_time_end || '18:00',
    bokadirekt_webhook_secret: initialData?.bokadirekt_webhook_secret || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BusinessFormData, string>>>({});
  const [priceListFile, setPriceListFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    });
    // Clear error for this field
    if (errors[name as keyof BusinessFormData]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BusinessFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email address';
    }

    if (formData.twilio_phone_number && !/^\+?[1-9]\d{1,14}$/.test(formData.twilio_phone_number.replace(/\s/g, ''))) {
      newErrors.twilio_phone_number = 'Invalid phone number format (e.g., +46 70 123 45 67)';
    }

    if (formData.retention_months_new < 1 || formData.retention_months_new > 24) {
      newErrors.retention_months_new = 'Must be between 1 and 24 months';
    }

    if (formData.retention_months_returning < 1 || formData.retention_months_returning > 24) {
      newErrors.retention_months_returning = 'Must be between 1 and 24 months';
    }

    if (formData.retention_days_after_booking < 1 || formData.retention_days_after_booking > 200) {
      newErrors.retention_days_after_booking = 'Must be between 1 and 200 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData, priceListFile: priceListFile || undefined });
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
            Slug *
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
          <p className="mt-1 text-sm text-gray-500">
            URL-friendly identifier for the business
          </p>
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
            placeholder="contact@example.com"
          />
          {errors.contact_email && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
          )}
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Configuration</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              placeholder="+46 10 123 45 67"
            />
            <p className="mt-1 text-sm text-gray-500">
              The Twilio phone number that will send retention SMS messages
            </p>
            {errors.twilio_phone_number && (
              <p className="mt-1 text-sm text-red-600">{errors.twilio_phone_number}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Retention Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="retention_months_new" className="block text-sm font-medium text-gray-700">
              New Customer Retention (months)
            </label>
            <input
              type="number"
              name="retention_months_new"
              id="retention_months_new"
              min="1"
              max="24"
              value={formData.retention_months_new}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            />
            <p className="mt-1 text-sm text-gray-500">
              How long to retain new customers
            </p>
            {errors.retention_months_new && (
              <p className="mt-1 text-sm text-red-600">{errors.retention_months_new}</p>
            )}
          </div>

          <div>
            <label htmlFor="retention_months_returning" className="block text-sm font-medium text-gray-700">
              Returning Customer Retention (months)
            </label>
            <input
              type="number"
              name="retention_months_returning"
              id="retention_months_returning"
              min="1"
              max="24"
              value={formData.retention_months_returning}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            />
            <p className="mt-1 text-sm text-gray-500">
              How long to retain returning customers
            </p>
            {errors.retention_months_returning && (
              <p className="mt-1 text-sm text-red-600">{errors.retention_months_returning}</p>
            )}
          </div>

          <div>
            <label htmlFor="retention_days_after_booking" className="block text-sm font-medium text-gray-700">
              Days After Booking
            </label>
            <input
              type="number"
              name="retention_days_after_booking"
              id="retention_days_after_booking"
              min="1"
              max="200"
              value={formData.retention_days_after_booking}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            />
            <p className="mt-1 text-sm text-gray-500">
              Days to wait after booking before sending retention SMS
            </p>
            {errors.retention_days_after_booking && (
              <p className="mt-1 text-sm text-red-600">{errors.retention_days_after_booking}</p>
            )}
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Send Time Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Time Type
            </label>
            <select
              name="sms_send_time_type"
              value={formData.sms_send_time_type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
            >
              <option value="random">Random Time (Business Hours)</option>
              <option value="fixed">Fixed Time</option>
            </select>
          </div>

          {formData.sms_send_time_type === 'fixed' ? (
            <div>
              <label htmlFor="sms_send_time" className="block text-sm font-medium text-gray-700">
                SMS Send Time
              </label>
              <input
                type="time"
                name="sms_send_time"
                id="sms_send_time"
                value={formData.sms_send_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
              />
              <p className="mt-1 text-sm text-gray-500">
                Time of day when retention SMS will be sent
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sms_send_time_start" className="block text-sm font-medium text-gray-700">
                  Random Start Time
                </label>
                <input
                  type="time"
                  name="sms_send_time_start"
                  id="sms_send_time_start"
                  value={formData.sms_send_time_start}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Earliest time to send SMS
                </p>
              </div>
              <div>
                <label htmlFor="sms_send_time_end" className="block text-sm font-medium text-gray-700">
                  Random End Time
                </label>
                <input
                  type="time"
                  name="sms_send_time_end"
                  id="sms_send_time_end"
                  value={formData.sms_send_time_end}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
                />
                <p className="mt-1 text-sm text-gray-500">
                Time range when SMS will be sent (randomized within this window)
              </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Import Price List (Optional)</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="priceListFile" className="block text-sm font-medium text-gray-700">
              Price List CSV File
            </label>
            <input
              type="file"
              id="priceListFile"
              accept=".csv"
              onChange={(e) => setPriceListFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload a CSV file with your services and prices. Format: name, description, price, duration, category
            </p>
          </div>

          {priceListFile && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                Selected file: <span className="font-medium">{priceListFile.name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Size: {(priceListFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {importResult && (
            <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <h4 className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-yellow-800'}`}>
                Import {importResult.success ? 'Completed' : 'Completed with Warnings'}
              </h4>
              <div className="mt-2 text-sm text-gray-700">
                <p>✅ Imported: {importResult.imported} services</p>
                {importResult.duplicates > 0 && <p>⚠️ Duplicates skipped: {importResult.duplicates}</p>}
                {importResult.errors > 0 && <p>❌ Errors: {importResult.errors}</p>}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Example:</h4>
            <pre className="text-xs text-blue-800 bg-white p-2 rounded border border-blue-200">
{`name,description,price,duration,category
Haircut,Standard haircut,299,30,Hair
Beard Trim,Beard trim with hot towel,149,20,Beard
Color,Full color treatment,599,90,Color`}
            </pre>
            <p className="text-xs text-blue-700 mt-2">
              Only 'name' and 'price' columns are required. Others are optional.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Boka Direkt Webhook Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="bokadirekt_webhook_secret" className="block text-sm font-medium text-gray-700">
              Webhook Secret (Optional)
            </label>
            <input
              type="text"
              name="bokadirekt_webhook_secret"
              id="bokadirekt_webhook_secret"
              value={formData.bokadirekt_webhook_secret}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border-gray-300"
              placeholder="Leave empty if not using webhook secret"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional secret for securing Boka Direkt webhook. If set, must match the secret in Boka Direkt.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">After creating this business:</h4>
            <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
              <li>Go to Business Management and click "Webhook" for this business</li>
              <li>Copy the webhook URL and Business ID</li>
              <li>Configure these in Boka Direkt's webhook settings</li>
              <li>Test the connection to ensure it's working</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Business' : 'Create Business'}
        </button>
      </div>
    </form>
  );
};

export default BusinessForm;
