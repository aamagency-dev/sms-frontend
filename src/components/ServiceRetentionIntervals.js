import React, { useState, useEffect } from 'react';
import { serviceRetentionApi, SERVICE_CATEGORIES, formatInterval, parseInterval } from '../services/serviceRetentionApi';
import './ServiceRetentionIntervals.css';

const ServiceRetentionIntervals = ({ businessId }) => {
  const [intervals, setIntervals] = useState({});
  const [categories, setCategories] = useState(SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    category: 'mens_hair',
    interval: 1.5
  });

  useEffect(() => {
    loadIntervals();
    loadCategories();
  }, [businessId]);

  const loadIntervals = async () => {
    try {
      setLoading(true);
      const data = await serviceRetentionApi.getIntervals(businessId);
      setIntervals(data);
    } catch (error) {
      console.error('Failed to load intervals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await serviceRetentionApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleIntervalChange = async (serviceName, newInterval) => {
    const parsed = parseInterval(newInterval);
    if (parsed === null) return;

    setSaving(true);
    try {
      await serviceRetentionApi.updateInterval(businessId, serviceName, parsed);
      
      // Update local state
      setIntervals(prev => {
        const updated = { ...prev };
        for (const category in updated) {
          const service = updated[category].find(s => s.service_name === serviceName);
          if (service) {
            service.interval_months = parsed;
          }
        }
        return updated;
      });
      
      setEditingService(null);
    } catch (error) {
      console.error('Failed to update interval:', error);
      alert('Kunde inte uppdatera intervall. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) {
      alert('Ange ett namn för tjänsten');
      return;
    }

    setSaving(true);
    try {
      await serviceRetentionApi.createInterval(businessId, {
        service_name: newService.name,
        service_category: newService.category,
        interval_months: newService.interval
      });

      // Reload intervals
      await loadIntervals();
      
      // Reset form
      setNewService({
        name: '',
        category: 'mens_hair',
        interval: 1.5
      });
    } catch (error) {
      console.error('Failed to add service:', error);
      alert('Kunde inte lägga till tjänst. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Är du säker på att du vill ta bort ${serviceName}?`)) {
      return;
    }

    setSaving(true);
    try {
      await serviceRetentionApi.deleteInterval(serviceId);
      await loadIntervals();
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Kunde inte ta bort tjänst. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Laddar...</div>;
  }

  return (
    <div className="service-retention-intervals">
      <h2>Service Retention Intervals</h2>
      <p className="description">
        Konfigurera hur ofta att skicka uppföljnings-SMS för olika tjänster
      </p>

      <div className="categories">
        {Object.entries(categories).map(([categoryKey, category]) => (
          <div key={categoryKey} className="category-section">
            <h3>
              <span className="icon">{category.icon}</span>
              {category.name}
            </h3>
            <p className="category-description">{category.description}</p>
            
            <div className="services">
              {intervals[categoryKey]?.map(service => (
                <div key={service.id} className="service-item">
                  <span className="service-name">{service.service_name}</span>
                  
                  {editingService === service.service_name ? (
                    <div className="interval-edit">
                      <input
                        type="number"
                        min="0.5"
                        max="12"
                        step="0.5"
                        defaultValue={service.interval_months}
                        onBlur={(e) => handleIntervalChange(service.service_name, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleIntervalChange(service.service_name, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                      <span className="unit">månader</span>
                    </div>
                  ) : (
                    <div 
                      className="interval-display"
                      onClick={() => setEditingService(service.service_name)}
                    >
                      {formatInterval(service.interval_months)}
                    </div>
                  )}
                  
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteService(service.id, service.service_name)}
                    title="Ta bort tjänst"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              
              {(!intervals[categoryKey] || intervals[categoryKey].length === 0) && (
                <div className="no-services">
                  <p>Inga tjänster i denna kategori</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="add-service-section">
        <h3>Lägg till ny tjänst</h3>
        <div className="add-service-form">
          <input
            type="text"
            placeholder="Tjänstnamn"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          />
          
          <select
            value={newService.category}
            onChange={(e) => setNewService({ ...newService, category: e.target.value })}
          >
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>
                {cat.name}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            min="0.5"
            max="12"
            step="0.5"
            value={newService.interval}
            onChange={(e) => setNewService({ ...newService, interval: parseFloat(e.target.value) })}
          />
          <span className="unit">månader</span>
          
          <button
            className="add-btn"
            onClick={handleAddService}
            disabled={saving}
          >
            {saving ? 'Sparar...' : 'Lägg till'}
          </button>
        </div>
      </div>

      <div className="info-section">
        <h3>Information</h3>
        <ul>
          <li>Kunder får ett uppföljnings-SMS efter det angivna antalet månader</li>
          <li>Intervallen kan vara mellan 0.5 och 12 månader</li>
          <li>Klicka på ett intervall för att ändra det</li>
          <li>Intervallen baseras på när kunden senast besökte salongen</li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceRetentionIntervals;
