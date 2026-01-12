import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { DashboardOverview, User, Business } from '../types';
import BusinessManagement from '../components/BusinessManagement';
import AdminCustomerImport from '../components/AdminCustomerImport';
import AdminCustomerExport from '../components/AdminCustomerExport';
import SmsSender from '../components/SmsSender';
import PriceListManager from '../components/PriceListManager';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  console.log('AdminDashboard rendering with user:', user);
  console.log('AdminDashboard component mounted');
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'businesses' | 'import-export' | 'send-sms' | 'price-list'>('overview');
  const [importExportTab, setImportExportTab] = useState<'import' | 'export'>('import');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');

  useEffect(() => {
    console.log('AdminDashboard useEffect triggered');
    const fetchData = async () => {
      try {
        console.log('Starting to fetch admin dashboard data...');
        // Use admin-specific overview
        const [overviewData] = await Promise.all([
          apiService.getAdminDashboardOverview(),
        ]);
        setOverview(overviewData);
        
        // Fetch all businesses for admin operations
        console.log('Fetching businesses...');
        const businessesData = await apiService.getAllBusinesses();
        console.log('Businesses received:', businessesData);
        setBusinesses(businessesData || []);
        
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <span className="px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full">
              Admin User
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('businesses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'businesses'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Business Management
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
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Revenue Analytics</h2>
              
              {/* Admin Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">B</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Businesses
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overview?.total_businesses || 0}
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
                          <span className="text-white text-sm font-medium">₽</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Revenue
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {new Intl.NumberFormat('sv-SE', {
                              style: 'currency',
                              currency: 'SEK'
                            }).format(overview?.total_revenue || 0)}
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
                          <span className="text-white text-sm font-medium">∅</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Avg Customer Value
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {new Intl.NumberFormat('sv-SE', {
                              style: 'currency',
                              currency: 'SEK'
                            }).format(
                              (overview?.total_customers || 0) > 0 
                                ? (overview?.total_revenue || 0) / (overview?.total_customers || 1)
                                : 0
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Revenue Table */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Revenue by Business
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Customer Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overview?.businesses?.map((business: any) => (
                          <tr key={business.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {business.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {business.customer_count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Intl.NumberFormat('sv-SE', {
                                style: 'currency',
                                currency: 'SEK'
                              }).format(business.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Intl.NumberFormat('sv-SE', {
                                style: 'currency',
                                currency: 'SEK'
                              }).format(business.avg_customer_value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!overview?.businesses || overview.businesses.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        No revenue data available. Import price lists and track customer interactions to see revenue analytics.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  Add New User
                </button>
              </div>
              
              <div className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <p className="text-gray-500">User management interface coming soon...</p>
                  <p className="text-sm text-gray-400 mt-2">Features will include: view all users, edit roles, deactivate accounts</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'businesses' && <BusinessManagement />}

          {activeTab === 'import-export' && (
            <div>
              {/* Sub-tabs for Import/Export */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setImportExportTab('import')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      importExportTab === 'import'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Import Customers
                  </button>
                  <button
                    onClick={() => setImportExportTab('export')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      importExportTab === 'export'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Export Customers
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {importExportTab === 'import' && <AdminCustomerImport businesses={businesses} />}
              {importExportTab === 'export' && <AdminCustomerExport businesses={businesses} />}
            </div>
          )}

          {activeTab === 'send-sms' && (
            <div>
              {selectedBusinessId ? (
                <SmsSender businessId={selectedBusinessId} />
              ) : (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Business</h3>
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose a business...</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {activeTab === 'price-list' && (
            <div>
              {selectedBusinessId ? (
                <PriceListManager businessId={selectedBusinessId} />
              ) : (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Business</h3>
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose a business...</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
