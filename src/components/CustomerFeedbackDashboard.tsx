import React, { useState, useEffect, Fragment } from 'react';
import { apiService } from '../services/api';

interface CustomerFeedback {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  appointment_id?: string;
  feedback_type: 'positive' | 'negative' | 'neutral';
  original_message: string;
  ai_response: string;
  sentiment_score: number;
  status: 'new' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
}

const CustomerFeedbackDashboard: React.FC<{ businessId: string }> = ({ businessId }) => {
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'negative' | 'positive' | 'neutral'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [businessId, filter]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/feedback/${businessId}?type=${filter}`);
      setFeedback(response.data || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await apiService.put(`/api/feedback/${feedbackId}`, {
        status: newStatus,
        notes: notes || undefined
      });
      
      // Update local state
      setFeedback(prev => prev.map(f => 
        f.id === feedbackId 
          ? { ...f, status: newStatus as any, notes: notes || f.notes, reviewed_at: new Date().toISOString() }
          : f
      ));
      
      setShowDetailModal(false);
      setNotes('');
    } catch (error) {
      console.error('Error updating feedback:', error);
    } finally {
      setUpdating(false);
    }
  };

  const openDetailModal = (item: CustomerFeedback) => {
    setSelectedFeedback(item);
    setNotes(item.notes || '');
    setShowDetailModal(true);
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.5) return 'text-green-600';
    if (score < -0.5) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentEmoji = (type: string) => {
    switch (type) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '❓';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      new: 'bg-red-100 text-red-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="p-6">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Customer Feedback</h2>
        <div className="flex space-x-2">
          {(['all', 'negative', 'positive', 'neutral'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-md ${
                filter === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.map((item) => (
                <tr key={item.id} className={item.status === 'new' ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl">{getSentimentEmoji(item.feedback_type)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.customer_name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.customer_phone || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      "{item.original_message}"
                    </div>
                    {item.ai_response && (
                      <div className="text-sm text-gray-500 mt-1">
                        AI: "{item.ai_response.substring(0, 50)}..."
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getSentimentColor(item.sentiment_score)}`}>
                      {item.sentiment_score.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openDetailModal(item)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {feedback.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No feedback found
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Feedback Details - {selectedFeedback.feedback_type.toUpperCase()}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="text-sm text-gray-900">
                  {selectedFeedback.customer_name || 'Unknown'} ({selectedFeedback.customer_phone})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Original Message</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  "{selectedFeedback.original_message}"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">AI Response</label>
                <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded">
                  {selectedFeedback.ai_response}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sentiment Score</label>
                <p className={`text-sm font-medium ${getSentimentColor(selectedFeedback.sentiment_score)}`}>
                  {selectedFeedback.sentiment_score.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  placeholder="Add notes about this feedback..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <div className="space-x-2">
                  {selectedFeedback.status === 'new' && (
                    <Fragment>
                      <button
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'reviewed')}
                        disabled={updating}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'resolved')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark as Resolved
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'dismissed')}
                        disabled={updating}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </Fragment>
                  )}
                  {selectedFeedback.status !== 'new' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedFeedback.id, 'new')}
                      disabled={updating}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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

export default CustomerFeedbackDashboard;
