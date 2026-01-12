import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Customer } from '../types';

interface SmsSenderProps {
  businessId: string;
}

const SmsSender: React.FC<SmsSenderProps> = ({ businessId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendResult, setSendResult] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await apiService.getBusinessCustomers(businessId);
      setCustomers(data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleCustomerToggle = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleSendSms = async () => {
    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    setSendResult(null);

    try {
      const response = await apiService.sendBulkSms({
        customer_ids: selectedCustomers,
        message: message.trim(),
        business_id: businessId
      });
      
      setSendResult(response);
      setSelectedCustomers([]);
      setMessage('');
    } catch (error: any) {
      console.error('Failed to send SMS:', error);
      alert(error.response?.data?.detail || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_number.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Send SMS</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Select Customers</h3>
            <span className="text-sm text-gray-500">
              {selectedCustomers.length} selected
            </span>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="w-full mb-4 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {selectedCustomers.length === filteredCustomers.length ? 'Deselect All' : 'Select All'}
          </button>

          {/* Customer List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredCustomers.map((customer) => (
              <label
                key={customer.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => handleCustomerToggle(customer.id)}
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.phone_number}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Message Composition */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Message</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMS Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              maxLength={160}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {message.length}/160 characters
            </div>
          </div>

          <button
            onClick={handleSendSms}
            disabled={loading || selectedCustomers.length === 0 || !message.trim()}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : `Send SMS to ${selectedCustomers.length} customer${selectedCustomers.length !== 1 ? 's' : ''}`}
          </button>

          {/* Send Result */}
          {sendResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="text-sm font-medium text-green-900 mb-2">Send Results:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Successfully queued: {sendResult.queued_count}</li>
                {sendResult.failed_count > 0 && (
                  <li>✗ Failed: {sendResult.failed_count}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmsSender;
