import React, { useState } from 'react';
import { apiService } from '../services/api';

interface CustomerExportProps {
  businessId: string;
}

const CustomerExport: React.FC<CustomerExportProps> = ({ businessId }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visitStatus, setVisitStatus] = useState<'all' | 'visited' | 'not_visited'>('all');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    
    try {
      const blob = await apiService.exportCustomers(
        businessId,
        startDate || undefined,
        endDate || undefined,
        visitStatus === 'all' ? undefined : visitStatus === 'visited' ? 'true' : 'false'
      );
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(error.response?.data?.detail || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Export Customers</h2>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Status
            </label>
            <select
              value={visitStatus}
              onChange={(e) => setVisitStatus(e.target.value as 'all' | 'visited' | 'not_visited')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Customers</option>
              <option value="visited">Visited</option>
              <option value="not_visited">Not Visited</option>
            </select>
          </div>
          
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Exporting...' : 'Export to CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerExport;