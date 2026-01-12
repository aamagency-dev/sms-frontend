import React, { useState } from 'react';
import { Business } from '../types';

interface WebhookManagerProps {
  business: Business;
  onClose: () => void;
}

const WebhookManager: React.FC<WebhookManagerProps> = ({ business, onClose }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState('');

  // Generate webhook URL
  React.useEffect(() => {
    const url = `${window.location.origin}/api/webhooks/webhook/bokadirekt`;
    setWebhookUrl(url);
  }, []);

  const testWebhook = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const testData = {
      Id: `test-${Date.now()}`,
      LocationId: business.id,
      Customer: {
        FirstName: "Test",
        LastName: "Customer",
        MobilePhoneNumber: "+46700000000",
        Email: "test@example.com"
      },
      ServiceName: "Test Service",
      Price: "299",
      PersonName: "Test Stylist",
      StartTime: new Date().toISOString(),
      EndTime: new Date(Date.now() + 3600000).toISOString(),
      BookingStartDate: new Date().toISOString(),
      EventCreated: new Date().toISOString(),
      Cancelled: false,
      Status: "confirmed"
    };

    try {
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      };
      
      if (webhookSecret) {
        headers['Webhook-Secret'] = webhookSecret;
      }

      const response = await fetch('http://localhost:8000/api/webhooks/webhook/bokadirekt', {
        method: 'POST',
        headers,
        body: JSON.stringify(testData)
      });

      const result = {
        timestamp: new Date().toLocaleTimeString(),
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };

      setTestResults([result]);
    } catch (error) {
      setTestResults([{
        timestamp: new Date().toLocaleTimeString(),
        status: 'ERROR',
        statusText: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }]);
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert('Webhook URL copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Webhook URL */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Boka Direkt Webhook Configuration</h3>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Use this URL in Boka Direkt to send booking data to this system
          </p>
        </div>
      </div>

      {/* Webhook Secret (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook Secret (Optional)
        </label>
        <input
          type="text"
          value={webhookSecret}
          onChange={(e) => setWebhookSecret(e.target.value)}
          placeholder="Leave empty if not using webhook secret"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          If Boka Direkt requires a secret, enter it here and in Boka Direkt's webhook configuration
        </p>
      </div>

      {/* Business ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business ID (for Boka Direkt)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={business.id}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(business.id);
              alert('Business ID copied to clipboard!');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            Copy ID
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Use this Business ID when configuring the location in Boka Direkt
        </p>
      </div>

      {/* Test Webhook */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Test Webhook</h4>
        <button
          onClick={testWebhook}
          disabled={isTesting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          {isTesting ? 'Testing...' : 'Send Test Webhook'}
        </button>
        <p className="mt-2 text-sm text-gray-600">
          Send a test booking to verify the webhook is working
        </p>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Test Results</h4>
          <div className="bg-gray-50 p-4 rounded-md">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{result.timestamp}</span>
                  <span className={`text-sm font-bold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.statusText}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Setup Instructions:</h4>
        <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
          <li>Copy the Webhook URL above</li>
          <li>Copy the Business ID for this location</li>
          <li>In Boka Direkt, go to webhook settings</li>
          <li>Configure webhook with the URL and Business ID</li>
          <li>Test the connection using the test button above</li>
          <li>Save your settings in Boka Direkt</li>
        </ol>
      </div>
    </div>
  );
};

export default WebhookManager;
