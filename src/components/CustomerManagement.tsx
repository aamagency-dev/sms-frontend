import React, { useState, useEffect } from 'react';
import CustomerImport from './CustomerImport';
import CustomerExport from './CustomerExport';

const CustomerManagement: React.FC<{ businessId: string }> = ({ businessId }) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Import Customers
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Export Customers
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'import' ? (
          <CustomerImport 
            businessId={businessId} 
            onImportComplete={handleImportComplete}
          />
        ) : (
          <CustomerExport businessId={businessId} />
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
