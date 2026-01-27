import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, MessageSquare, Users, AlertCircle, CheckCircle, Clock, TrendingUp, Cpu, HardDrive } from 'lucide-react';
import './SystemHealth.css';

interface HealthData {
  status: string;
  health_score: number;
  timestamp: string;
  uptime: {
    seconds: number;
    hours: number;
    days: number;
    formatted: string;
  };
  system: {
    cpu_percent: number;
    memory_percent: number;
    memory_used_gb: number;
    memory_total_gb: number;
    disk_percent: number;
    disk_used_gb: number;
    disk_total_gb: number;
  };
  database: {
    status: string;
    response_time_ms: number | null;
  };
  sms_activity: {
    sent_24h: number;
    received_24h: number;
    failed_24h: number;
  };
  statistics: {
    active_businesses: number;
    total_users: number;
    rate_limit_violations_24h: number;
  };
  services: {
    backend: string;
    database: string;
    sms_provider: string;
    gpt: string;
  };
  environment: string;
  version: string;
}

const SystemHealth: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/health/detailed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }

      const data = await response.json();
      setHealthData(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'unhealthy':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('sv-SE');
  };

  if (loading) {
    return (
      <div className="system-health-loading">
        <div className="spinner"></div>
        <p>Laddar systemstatus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-health-error">
        <AlertCircle size={48} />
        <h3>Kunde inte ladda systemstatus</h3>
        <p>{error}</p>
        <button onClick={fetchHealthData}>Försök igen</button>
      </div>
    );
  }

  if (!healthData) {
    return null;
  }

  return (
    <div className="system-health">
      {/* Header */}
      <div className="health-header">
        <div className="health-title">
          <Activity size={24} />
          <h2>Systemstatus</h2>
        </div>
        <div className="health-meta">
          <span className="last-update">
            <Clock size={16} />
            Uppdaterad: {formatTimestamp(lastUpdate.toISOString())}
          </span>
          <button onClick={fetchHealthData} className="refresh-button">
            Uppdatera
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="health-overview">
        <div className="status-card main-status" style={{ borderColor: getStatusColor(healthData.status) }}>
          <div className="status-icon" style={{ color: getStatusColor(healthData.status) }}>
            {healthData.status === 'healthy' ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
          </div>
          <div className="status-info">
            <h3>Systemet är {healthData.status === 'healthy' ? 'Igång' : healthData.status === 'degraded' ? 'Degraderat' : 'Nere'}</h3>
            <div className="health-score">
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${healthData.health_score}%`,
                    backgroundColor: getHealthScoreColor(healthData.health_score)
                  }}
                ></div>
              </div>
              <span className="score-text">{healthData.health_score}% Health Score</span>
            </div>
          </div>
        </div>

        <div className="status-card">
          <Clock size={24} />
          <div className="card-content">
            <h4>Uptime</h4>
            <p className="metric-value">{healthData.uptime.formatted}</p>
            <span className="metric-label">{healthData.uptime.hours} timmar</span>
          </div>
        </div>

        <div className="status-card">
          <Server size={24} />
          <div className="card-content">
            <h4>Environment</h4>
            <p className="metric-value">{healthData.environment}</p>
            <span className="metric-label">v{healthData.version}</span>
          </div>
        </div>
      </div>

      {/* System Resources */}
      <div className="health-section">
        <h3>
          <Cpu size={20} />
          Systemresurser
        </h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span>CPU</span>
              <span className="metric-value">{healthData.system.cpu_percent}%</span>
            </div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ 
                  width: `${healthData.system.cpu_percent}%`,
                  backgroundColor: healthData.system.cpu_percent > 80 ? '#ef4444' : '#10b981'
                }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Minne</span>
              <span className="metric-value">{healthData.system.memory_percent}%</span>
            </div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ 
                  width: `${healthData.system.memory_percent}%`,
                  backgroundColor: healthData.system.memory_percent > 85 ? '#ef4444' : '#10b981'
                }}
              ></div>
            </div>
            <span className="metric-detail">
              {healthData.system.memory_used_gb} GB / {healthData.system.memory_total_gb} GB
            </span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Disk</span>
              <span className="metric-value">{healthData.system.disk_percent}%</span>
            </div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ 
                  width: `${healthData.system.disk_percent}%`,
                  backgroundColor: healthData.system.disk_percent > 90 ? '#ef4444' : '#10b981'
                }}
              ></div>
            </div>
            <span className="metric-detail">
              {healthData.system.disk_used_gb} GB / {healthData.system.disk_total_gb} GB
            </span>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="health-section">
        <h3>
          <Server size={20} />
          Tjänster
        </h3>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-status" style={{ color: getStatusColor(healthData.services.backend) }}>
              {healthData.services.backend === 'healthy' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="service-info">
              <h4>Backend</h4>
              <span className={`status-badge ${healthData.services.backend}`}>
                {healthData.services.backend}
              </span>
            </div>
          </div>

          <div className="service-card">
            <div className="service-status" style={{ color: getStatusColor(healthData.database.status) }}>
              {healthData.database.status === 'healthy' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="service-info">
              <h4>Database</h4>
              <span className={`status-badge ${healthData.database.status}`}>
                {healthData.database.status}
              </span>
              {healthData.database.response_time_ms && (
                <span className="service-detail">{healthData.database.response_time_ms}ms</span>
              )}
            </div>
          </div>

          <div className="service-card">
            <div className="service-status" style={{ color: '#6b7280' }}>
              <MessageSquare size={20} />
            </div>
            <div className="service-info">
              <h4>SMS Provider</h4>
              <span className="status-badge unknown">
                {healthData.services.sms_provider}
              </span>
            </div>
          </div>

          <div className="service-card">
            <div className="service-status" style={{ color: '#6b7280' }}>
              <TrendingUp size={20} />
            </div>
            <div className="service-info">
              <h4>GPT</h4>
              <span className="status-badge unknown">
                {healthData.services.gpt}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Activity */}
      <div className="health-section">
        <h3>
          <MessageSquare size={20} />
          SMS-aktivitet (24h)
        </h3>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-icon sent">
              <MessageSquare size={24} />
            </div>
            <div className="activity-info">
              <span className="activity-label">Skickade</span>
              <span className="activity-value">{healthData.sms_activity.sent_24h}</span>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-icon received">
              <MessageSquare size={24} />
            </div>
            <div className="activity-info">
              <span className="activity-label">Mottagna</span>
              <span className="activity-value">{healthData.sms_activity.received_24h}</span>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-icon failed">
              <AlertCircle size={24} />
            </div>
            <div className="activity-info">
              <span className="activity-label">Misslyckade</span>
              <span className="activity-value">{healthData.sms_activity.failed_24h}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="health-section">
        <h3>
          <Users size={20} />
          Statistik
        </h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Aktiva företag</span>
            <span className="stat-value">{healthData.statistics.active_businesses}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Totalt användare</span>
            <span className="stat-value">{healthData.statistics.total_users}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Rate limit överträdelser (24h)</span>
            <span className={`stat-value ${healthData.statistics.rate_limit_violations_24h > 0 ? 'warning' : ''}`}>
              {healthData.statistics.rate_limit_violations_24h}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
