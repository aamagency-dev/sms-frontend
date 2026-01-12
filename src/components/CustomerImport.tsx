import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface ImportResult {
  success_count: number;
  error_count: number;
  errors: string[];
  duplicates: string[];
}

interface CustomerImportProps {
  businessId: string;
  onImportComplete: () => void;
}

const CustomerImport: React.FC<CustomerImportProps> = ({ businessId, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiService.importCustomers(file, businessId);

      setResult(response);
      if (response.success_count > 0) {
        onImportComplete();
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      alert(error.response?.data?.detail || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'name,phone_number,email,notes,last_visit\nJohn Doe,+46123456789,john@example.com,Regular customer,2024-01-15\nJane Smith,+46987654321,jane@example.com,New customer,';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Import Customers</h2>
      
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
Erik Johansson,+46702345678`}</pre>
        </div>
        
        <p className="text-xs text-blue-600 mt-3">
          💡 Tip: The first row should contain column headers. Duplicate phone numbers will be automatically skipped.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Upload a CSV file with customer information. 
            <button
              type="button"
              onClick={downloadTemplate}
              className="text-purple-600 hover:text-purple-500 ml-1"
            >
              Download template
            </button>
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>

        {file && (
          <div>
            <p className="text-sm text-gray-600">Selected file: {file.name}</p>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Importing...' : 'Import Customers'}
        </button>

        {result && (
          <div className="mt-4 space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm font-medium text-green-800">
                Successfully imported: {result.success_count} customers
              </p>
            </div>

            {result.error_count > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Errors: {result.error_count} rows failed
                </p>
                <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.duplicates.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Duplicates skipped: {result.duplicates.length}
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                  {result.duplicates.map((phone, index) => (
                    <li key={index}>{phone}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerImport;
