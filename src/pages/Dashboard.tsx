import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import BusinessForm from '../components/BusinessForm';
import BusinessManagement from '../components/BusinessManagement';
import CustomerManagement from '../components/CustomerManagement';
import SmsSender from '../components/SmsSender';
import PriceListManager from '../components/PriceListManager';
import SMSConversationViewer from '../components/SMSConversationViewer';
import BusinessSettings from './BusinessSettings';
import { Business, Customer } from '../types';
import { DashboardOverview, ScheduledSms } from '../types';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'business-form' | 'business-management' | 'import-export' | 'send-sms' | 'price-list' | 'settings' | 'sms-conversations'>('overview');
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [scheduledSms, setScheduledSms] = useState<ScheduledSms[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('access_token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // Don't fetch data if user is admin (they use AdminDashboard)
        if (user?.role === 'admin') {
          setLoading(false);
          return;
        }

        const [overviewData, customersData, smsData] = await Promise.all([
          apiService.getDashboardOverview(),
          apiService.getRecentCustomers(),
          apiService.getScheduledSms(),
        ]);
        setOverview(overviewData);
        setRecentCustomers(customersData);
        setScheduledSms(smsData);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        // If authentication error, redirect to login
        if (error.response?.status === 401) {
          window.location.href = '/login';
        } else {
          // Show error message with details
          const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
          alert(`Failed to load dashboard data: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBusinessSubmit = async (businessData: any) => {
    try {
      if (editingBusiness) {
        await apiService.updateBusiness(editingBusiness.id, businessData);
      } else {
        await apiService.createBusiness(businessData);
      }
      setShowBusinessForm(false);
      setEditingBusiness(null);
      setActiveTab('business-management');
    } catch (error) {
      console.error('Failed to save business:', error);
    }
  };

  const handleBusinessCancel = () => {
    setShowBusinessForm(false);
    setEditingBusiness(null);
    setActiveTab('business-management');
  };

  // Show admin dashboard if user is admin
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Dashboard{overview?.business ? ` - ${overview.business.name}` : ''}
          </h1>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('business-form')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'business-form'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Add Business
              </button>
              <button
                onClick={() => setActiveTab('business-management')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'business-management'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Businesses
              </button>
              <button
                onClick={() => setActiveTab('import-export')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'import-export'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Import/Export
              </button>
              <button
                onClick={() => setActiveTab('send-sms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'send-sms'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Send SMS
              </button>
              <button
                onClick={() => setActiveTab('price-list')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'price-list'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Price List
              </button>
              <button
                onClick={() => setActiveTab('sms-conversations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sms-conversations'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💬 SMS Conversations
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚙️ Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              {overview?.message ? (
                // Welcome message for users without business
                <div className="bg-white shadow rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Customer Follow-up System!</h2>
                  <p className="text-gray-600 mb-6">{overview.message}</p>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Getting Started:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Click on "Add Business" to create your first business</li>
                      <li>Configure your SMS settings and follow-up rules</li>
                      <li>Import existing customers or add them manually</li>
                      <li>Start automating your customer retention!</li>
                    </ol>
                    <button
                      onClick={() => setActiveTab('business-form')}
                      className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Business
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">C</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Customers
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overview?.total_customers || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">N</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            New This Month
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overview?.new_this_month || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">A</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Customers
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overview?.active_customers || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">S</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Scheduled SMS
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overview?.scheduled_sms || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Customers */}
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Recent Customers
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Visit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentCustomers.map((customer) => (
                          <tr key={customer.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {customer.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.phone_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.last_visit
                                ? new Date(customer.last_visit).toLocaleDateString()
                                : 'Never'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Scheduled SMS */}
              {scheduledSms.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Scheduled SMS
                    </h3>
                    <div className="space-y-3">
                      {scheduledSms.map((sms) => (
                        <div
                          key={sms.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              To: {sms.customers?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Scheduled: {new Date(sms.scheduled_at).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => apiService.cancelScheduledSms(sms.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          )}
          
          {activeTab === 'business-form' && <BusinessForm onSubmit={handleBusinessSubmit} onCancel={handleBusinessCancel} initialData={editingBusiness || undefined} />}
          
          {activeTab === 'business-management' && <BusinessManagement />}
          
          {activeTab === 'import-export' && <CustomerManagement businessId={overview?.business?.id || ''} />}
          
          {activeTab === 'send-sms' && <SmsSender businessId={overview?.business?.id || ''} />}
          
          {activeTab === 'price-list' && <PriceListManager businessId={overview?.business?.id || ''} />}
          
          {activeTab === 'sms-conversations' && overview?.business && (
            <SMSConversationViewer businessId={overview.business.id} />
          )}
          
          {activeTab === 'settings' && overview?.business && (
            <BusinessSettings 
              business={overview.business} 
              onUpdate={(updatedBusiness) => {
                setOverview(prev => {
                  if (!prev) return null;
                  return { ...prev, business: { ...prev.business, ...updatedBusiness } } as DashboardOverview;
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
