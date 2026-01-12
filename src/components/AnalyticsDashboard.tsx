import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../services/api';

interface AnalyticsData {
  basic_metrics: {
    total_customers: number;
    active_customers: number;
    new_customers: number;
    retention_rate: number;
    customers_need_follow_up: number;
  };
  sms_effectiveness: {
    total_sent: number;
    retention_campaigns: {
      sent: number;
      delivered: number;
      success_rate: number;
    };
    review_campaigns: {
      sent: number;
      delivered: number;
      success_rate: number;
    };
    rebookings_generated: number;
  };
  satisfaction: {
    avg_score: number;
    distribution: { [key: string]: number };
    trend: string;
  };
  revenue: {
    monthly_trend: { [key: string]: number };
    revenue_per_month: number;
  };
  ai_insights: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(12);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (businesses.length > 0) {
      if (!selectedBusinessId && businesses[0]?.id) {
        setSelectedBusinessId(businesses[0].id);
      }
    }
  }, [businesses]);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchAnalytics();
    }
  }, [timeRange, selectedBusinessId]);

  const fetchBusinesses = async () => {
    try {
      const response = await apiService.getAllBusinesses();
      setBusinesses(response || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedBusinessId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getRetentionAnalytics(timeRange, selectedBusinessId);
      
      if (response.error) {
        console.error('Analytics error:', response.error);
        setAnalytics(null);
      } else {
        setAnalytics(response);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
        <div className="text-red-600 text-lg mb-2">⚠️ Kunde inte ladda analysdata</div>
        <p className="text-red-500">Detta kan bero på:</p>
        <ul className="text-red-500 text-sm mt-2 space-y-1">
          <li>• Inga företag finns i systemet</li>
          <li>• Inga kunder har bokats än</li>
          <li>• Databasmigrationen har inte körts</li>
        </ul>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Försök igen
        </button>
      </div>
    );
  }

  // Prepare data for charts
  const revenueData = Object.entries(analytics.revenue.monthly_trend).map(([month, revenue]) => ({
    month: new Date(month + '-01').toLocaleDateString('sv-SE', { month: 'short' }),
    revenue: revenue
  }));

  const satisfactionData = Object.entries(analytics.satisfaction.distribution).map(([score, count]) => ({
    name: `${score} stjärnor`,
    value: count
  }));

  const smsData = [
    { name: 'Retention SMS', skickat: analytics.sms_effectiveness.retention_campaigns.sent, levererat: analytics.sms_effectiveness.retention_campaigns.delivered },
    { name: 'Recension SMS', skickat: analytics.sms_effectiveness.review_campaigns.sent, levererat: analytics.sms_effectiveness.review_campaigns.delivered }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kundlojalitetsanalys</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={3}>Senaste 3 månaderna</option>
            <option value={6}>Senaste 6 månaderna</option>
            <option value={12}>Senaste 12 månaderna</option>
            <option value={24}>Senaste 24 månaderna</option>
          </select>
        </div>
      </div>

      {/* AI Insights */}
      {analytics.ai_insights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🤖 AI-insikter</h3>
          <ul className="space-y-1">
            {analytics.ai_insights.map((insight, index) => (
              <li key={index} className="text-blue-800">• {insight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Totalt antal kunder</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.basic_metrics.total_customers}</p>
          <p className="text-sm text-green-600">+{analytics.basic_metrics.new_customers} nya</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Retentiongrad</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.basic_metrics.retention_rate}%</p>
          <p className="text-sm text-gray-600">{analytics.basic_metrics.active_customers} aktiva</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Nöjdhet (genomsnitt)</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.satisfaction.avg_score.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Trend: {analytics.satisfaction.trend}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Återbokningar via SMS</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.sms_effectiveness.rebookings_generated}</p>
          <p className="text-sm text-gray-600">Senaste {timeRange} månaderna</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Intäktsutveckling</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} kr`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Intäkter" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Satisfaction Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fördelning av omdömen</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={satisfactionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {satisfactionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* SMS Effectiveness */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS-effektivitet</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={smsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="skickat" fill="#8884d8" />
              <Bar dataKey="levererat" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Follow-up Needed */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kunder som behöver uppföljning</h3>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-orange-600">{analytics.basic_metrics.customers_need_follow_up}</p>
            <p className="text-gray-600 mt-2">kunder behöver kontaktas</p>
            <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              Visa kunder
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detaljerad statistik</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">SMS skickade totalt</p>
            <p className="text-xl font-semibold">{analytics.sms_effectiveness.total_sent}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Leveransgrad (Retention)</p>
            <p className="text-xl font-semibold">{analytics.sms_effectiveness.retention_campaigns.success_rate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Leveransgrad (Recension)</p>
            <p className="text-xl font-semibold">{analytics.sms_effectiveness.review_campaigns.success_rate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Intäkt/månad (snitt)</p>
            <p className="text-xl font-semibold">{analytics.revenue.revenue_per_month} kr</p>
          </div>
        </div>
      </div>
    </div>
  );
};
