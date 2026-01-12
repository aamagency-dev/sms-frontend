import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  category?: string;
  is_active: boolean;
}

interface PriceListProps {
  businessId: string;
}

const PriceListManager: React.FC<PriceListProps> = ({ businessId }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'import'>('list');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await apiService.getPriceList(businessId);
      setServices(data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('business_id', businessId);

      const response = await apiService.importPriceList(formData);
      setImportResult(response);
      
      if (response.imported_count > 0) {
        fetchServices(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      alert(error.response?.data?.detail || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportPriceList(businessId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `price_list_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(error.response?.data?.detail || 'Export failed');
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Price List Management</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Current Price List
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Import/Export
          </button>
        </nav>
      </div>

      {/* Current Price List */}
      {activeTab === 'list' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Services ({services.length})
            </h3>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Export CSV
            </button>
          </div>

          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category} className="mb-8">
              <h4 className="text-md font-semibold text-gray-800 mb-3">{category}</h4>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryServices.map((service) => (
                      <tr key={service.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {service.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {service.duration_minutes ? `${service.duration_minutes} min` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('sv-SE', {
                            style: 'currency',
                            currency: 'SEK'
                          }).format(service.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <p className="text-gray-500">No services found. Import a price list to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Import/Export */}
      {activeTab === 'import' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 File Format Requirements</h3>
            <p className="text-blue-800 mb-3">Your CSV file should include the following columns:</p>
            
            <div className="bg-white rounded-md p-3 mb-3">
              <code className="text-sm">
                name,description,price,duration,category
              </code>
            </div>
            
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>name</strong>: Service name (required)</p>
              <p>• <strong>description</strong>: Service description (optional)</p>
              <p>• <strong>price</strong>: Price in SEK (required)</p>
              <p>• <strong>duration</strong>: Duration in minutes (optional)</p>
              <p>• <strong>category</strong>: Service category (optional)</p>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-2">Example CSV content:</p>
              <pre className="text-xs text-blue-800 overflow-x-auto">
{`name,description,price,duration,category
Haircut,Standard haircut including wash,299,30,Hair
Beard Trim,Beard trim with hot towel,149,20,Beard
Color,Full color treatment,599,90,Color
Manicure,Classic manicure,249,45,Nails`}</pre>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Import Price List</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !file}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Importing...' : 'Import Price List'}
            </button>

            {importResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Import Results:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Total rows processed: {importResult.total_rows}</li>
                  <li>Successfully imported: {importResult.imported_count}</li>
                  <li>Duplicates skipped: {importResult.duplicate_count}</li>
                  {importResult.error_count > 0 && (
                    <li className="text-red-600">
                      Errors: {importResult.error_count} rows failed
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceListManager;
