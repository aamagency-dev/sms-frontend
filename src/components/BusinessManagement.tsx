import React, { useState, useEffect } from 'react';
import BusinessForm from './BusinessForm';
import PriceListManager from './PriceListManager';
import WebhookManager from './WebhookManager';
import SMSSettings from './SMSSettings';
import { Business } from '../types';
import { BusinessFormData } from './BusinessForm';
import apiService from '../services/api';

const BusinessManagement: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBusinessForPriceList, setSelectedBusinessForPriceList] = useState<Business | null>(null);
  const [selectedBusinessForWebhook, setSelectedBusinessForWebhook] = useState<Business | null>(null);
  const [selectedBusinessForSMS, setSelectedBusinessForSMS] = useState<Business | null>(null);

  // Fetch businesses from API
  const fetchBusinesses = async (setLoadingState = true) => {
    try {
      if (setLoadingState) {
        setLoading(true);
      }
      console.log('Fetching businesses...');
      const data = await apiService.getAllBusinesses();
      console.log('Fetched businesses:', data);
      setBusinesses(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      return [];
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  };

  // Fetch businesses on component mount
  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleAddBusiness = () => {
    setEditingBusiness(null);
    setShowForm(true);
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setShowForm(true);
  };

  const handlePriceList = (business: Business) => {
    setSelectedBusinessForPriceList(business);
  };

  const handleClosePriceList = () => {
    setSelectedBusinessForPriceList(null);
  };

  const handleWebhook = (business: Business) => {
    setSelectedBusinessForWebhook(business);
  };

  const handleSMSSettings = (business: Business) => {
    setSelectedBusinessForSMS(business);
  };

  const handleCloseWebhook = () => {
    setSelectedBusinessForWebhook(null);
  };

  const handleCloseSMSSettings = () => {
    setSelectedBusinessForSMS(null);
  };

  const handleFormSubmit = async (data: BusinessFormData) => {
    try {
      setLoading(true);
      console.log('Submitting business data:', data);
      
      let businessId: string;
      
      if (editingBusiness) {
        // Update existing business
        console.log('Updating business:', editingBusiness.id);
        await apiService.updateBusiness(editingBusiness.id, data);
        businessId = editingBusiness.id;
      } else {
        // Create new business
        console.log('Creating new business...');
        const result = await apiService.createBusiness(data);
        businessId = result.id;
        console.log('Business created successfully:', result);
      }
      
      // Import price list if file is provided
      if (data.priceListFile && !editingBusiness) {
        console.log('Importing price list...');
        try {
          const formData = new FormData();
          formData.append('file', data.priceListFile);
          formData.append('business_id', businessId);
          
          const importResult = await apiService.importPriceList(formData);
          console.log('Price list imported:', importResult);
          
          // Show success message
          alert(`Business created successfully!\n\nPrice list imported:\n✅ ${importResult.imported} services imported${importResult.duplicates > 0 ? `\n⚠️ ${importResult.duplicates} duplicates skipped` : ''}${importResult.errors > 0 ? `\n❌ ${importResult.errors} errors` : ''}`);
        } catch (importError: any) {
          console.error('Failed to import price list:', importError);
          alert(`Business created successfully!\n\nHowever, price list import failed: ${importError.response?.data?.detail || importError.message}`);
        }
      } else {
        alert(editingBusiness ? 'Business updated successfully!' : 'Business created successfully!');
      }
      
      // Refresh the businesses list
      console.log('Refreshing businesses list...');
      const refreshedBusinesses = await fetchBusinesses(false);
      console.log('Businesses refreshed, current list:', refreshedBusinesses);
      setShowForm(false);
      setEditingBusiness(null);
    } catch (error: any) {
      console.error('Failed to save business:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      alert(`Failed to save business: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBusiness(null);
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (!window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteBusiness(businessId);
      // Refresh the businesses list
      await fetchBusinesses();
    } catch (error) {
      console.error('Failed to delete business:', error);
      alert('Failed to delete business. Please try again.');
    }
  };

  if (showForm) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            {editingBusiness ? 'Edit Business' : 'Add New Business'}
          </h3>
          <BusinessForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            initialData={editingBusiness || undefined}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium text-gray-900">Businesses</h3>
            <p className="mt-2 text-sm text-gray-700">
              A list of all businesses in the system including their retention settings.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={handleAddBusiness}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Add New Business
            </button>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-500">Loading businesses...</p>
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No businesses yet. Add your first business to get started.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Contact
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Twilio Phone
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Google Review
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SMS Settings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Send Schedule
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {businesses.map((business) => (
                      <tr key={business.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {business.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {business.config_status ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{business.config_status.status_label}</span>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    business.config_status.status === 'ready' ? 'bg-green-500' :
                                    business.config_status.status === 'incomplete' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${business.config_status.completion_percent}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                {business.config_status.completion_percent}% complete
                              </span>
                              {business.config_status.missing_required.length > 0 && (
                                <span className="text-xs text-red-600 mt-1">
                                  Missing: {business.config_status.missing_required.join(', ')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Unknown</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div>
                            {business.contact_phone && <div>{business.contact_phone}</div>}
                            {business.contact_email && <div>{business.contact_email}</div>}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="text-purple-600 font-medium">
                            {business.sms_phone_number || 'Not set'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {business.google_review_link ? (
                            <a 
                              href={business.google_review_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Review Link
                            </a>
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {business.sms_settings ? (
                            <div>
                              <div>Post-appointment: {business.sms_settings.post_appointment?.enabled ? `${business.sms_settings.post_appointment?.delay_hours}h after` : 'Disabled'}</div>
                              <div>Business hours: {business.sms_settings.post_appointment?.business_hours_only ? 'Yes' : 'No'}</div>
                              <div>Retention: {business.sms_settings.retention?.enabled ? `${business.sms_settings.retention?.default_interval_months} months` : 'Disabled'}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not configured</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {business.sms_settings?.post_appointment?.enabled ? (
                            <div>
                              <div>Send: {business.sms_settings.post_appointment?.send_start_time} - {business.sms_settings.post_appointment?.send_end_time}</div>
                              <div>Weekends: {business.sms_settings.post_appointment?.skip_weekends ? 'Skip' : 'Send'}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Disabled</span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            onClick={() => handleEditBusiness(business)}
                            className="text-purple-600 hover:text-purple-900 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePriceList(business)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Price List
                          </button>
                          <button
                            onClick={() => handleWebhook(business)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Webhook
                          </button>
                          <button
                            onClick={() => handleSMSSettings(business)}
                            className="text-orange-600 hover:text-orange-900 mr-2"
                          >
                            SMS Settings
                          </button>
                          <button
                            onClick={() => handleDeleteBusiness(business.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Price List Modal */}
      {selectedBusinessForPriceList && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClosePriceList}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4">
                      Price List - {selectedBusinessForPriceList.name}
                    </h3>
                    <PriceListManager businessId={selectedBusinessForPriceList.id} />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleClosePriceList}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Webhook Modal */}
      {selectedBusinessForWebhook && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseWebhook}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4">
                      Webhook Configuration - {selectedBusinessForWebhook.name}
                    </h3>
                    <WebhookManager business={selectedBusinessForWebhook} onClose={handleCloseWebhook} />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseWebhook}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* SMS Settings Modal */}
      {selectedBusinessForSMS && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseSMSSettings}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4">
                      SMS Settings - {selectedBusinessForSMS.name}
                    </h3>
                    <SMSSettings businessId={selectedBusinessForSMS.id} />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseSMSSettings}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;
