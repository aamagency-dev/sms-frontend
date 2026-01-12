import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Business } from '../types';

const AdminCustomerImport: React.FC<{ businesses: Business[] }> = ({ businesses }) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedBusinessId) {
      alert('Please select a business and a file');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await apiService.importCustomers(file, selectedBusinessId);
      setResult(response);
    } catch (error: any) {
      console.error('Import failed:', error);
      alert(error.response?.data?.detail || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Import Customers (Admin)</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 File Format Requirements</h3>
        <p className="text-blue-800 mb-3">Your CSV file must include the following columns:</p>
        
        <div className="bg-white rounded-md p-3 mb-3">
          <code className="text-sm">
            name,phone_number
          </code>
        </div>
        
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>name</strong>: Customer's full name</p>
          <p>• <strong>phone_number</strong>: Phone number in international format (e.g., +46701234567)</p>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-md">
          <p className="text-sm font-medium text-blue-900 mb-2">Example CSV content:</p>
          <pre className="text-xs text-blue-800 overflow-x-auto">
{`name,phone_number
John Doe,+46701234567
Jane Smith,+46709876543
Erik Johansson,+46702345678
Anna Andersson,+46703456789
Magnus Nilsson,+46704567890`}</pre>
        </div>
        
        <p className="text-xs text-blue-600 mt-3">
          💡 Tip: The first row should contain column headers. Duplicate phone numbers will be automatically skipped.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
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

      {selectedBusinessId && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File (required columns: name, phone_number)
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
            {loading ? 'Importing...' : 'Import Customers'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Import Results:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>Total rows processed: {result.total_rows}</li>
                <li>Successfully imported: {result.imported_count}</li>
                <li>Duplicates skipped: {result.duplicate_count}</li>
                {result.errors.length > 0 && (
                  <li className="text-red-600">
                    Errors: {result.errors.length} rows failed
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCustomerImport;
