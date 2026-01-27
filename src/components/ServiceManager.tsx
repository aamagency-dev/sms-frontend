import React, { useState } from 'react';
import { Plus, Trash2, Scissors, Sparkles } from 'lucide-react';
import './ServiceManager.css';

interface Service {
  id?: string;
  name: string;
  interval_months: number;
  template?: string;
}

interface ServiceManagerProps {
  services: Record<string, { interval_months: number; template?: string }>;
  onChange: (services: Record<string, { interval_months: number; template?: string }>) => void;
}

// Predefined service templates for quick setup
const SERVICE_TEMPLATES = [
  { name: 'Herrklippning', interval_months: 1, category: 'Klippning' },
  { name: 'Damklippning', interval_months: 2, category: 'Klippning' },
  { name: 'Barnklippning', interval_months: 1, category: 'Klippning' },
  { name: 'Färgning', interval_months: 2, category: 'Färg' },
  { name: 'Slingor', interval_months: 3, category: 'Färg' },
  { name: 'Balayage', interval_months: 4, category: 'Färg' },
  { name: 'Permanent', interval_months: 3, category: 'Behandling' },
  { name: 'Keratinbehandling', interval_months: 4, category: 'Behandling' },
  { name: 'Klippning + Färg', interval_months: 2, category: 'Paket' },
  { name: 'Styling', interval_months: 1, category: 'Styling' },
  { name: 'Uppsättning', interval_months: 0, category: 'Styling' },
];

const ServiceManager: React.FC<ServiceManagerProps> = ({ services, onChange }) => {
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceInterval, setNewServiceInterval] = useState(2);
  const [showTemplates, setShowTemplates] = useState(false);

  // Convert services object to array for easier rendering
  const servicesList = Object.entries(services).map(([name, config]) => ({
    name,
    interval_months: config.interval_months,
    template: config.template || 'standard'
  }));

  const handleAddService = () => {
    if (!newServiceName.trim()) return;

    const updatedServices = {
      ...services,
      [newServiceName.trim()]: {
        interval_months: newServiceInterval,
        template: 'standard'
      }
    };

    onChange(updatedServices);
    setNewServiceName('');
    setNewServiceInterval(2);
  };

  const handleAddFromTemplate = (template: typeof SERVICE_TEMPLATES[0]) => {
    const updatedServices = {
      ...services,
      [template.name]: {
        interval_months: template.interval_months,
        template: 'standard'
      }
    };

    onChange(updatedServices);
    setShowTemplates(false);
  };

  const handleRemoveService = (serviceName: string) => {
    const updatedServices = { ...services };
    delete updatedServices[serviceName];
    onChange(updatedServices);
  };

  const handleUpdateService = (serviceName: string, field: 'interval_months', value: number) => {
    const updatedServices = {
      ...services,
      [serviceName]: {
        ...services[serviceName],
        [field]: value
      }
    };
    onChange(updatedServices);
  };

  // Group templates by category
  const groupedTemplates = SERVICE_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof SERVICE_TEMPLATES>);

  return (
    <div className="service-manager">
      <div className="service-header">
        <div className="service-title-row">
          <h4 className="service-title">
            <Scissors size={18} />
            Tjänster & Retention-intervaller
          </h4>
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="template-toggle-btn"
          >
            <Sparkles size={16} />
            {showTemplates ? 'Dölj mallar' : 'Visa mallar'}
          </button>
        </div>
        <p className="service-subtitle">
          Lägg till de tjänster salongen erbjuder och ställ in hur ofta kunder ska få retention-SMS
        </p>
      </div>

      {/* Service Templates */}
      {showTemplates && (
        <div className="service-templates">
          <h5 className="templates-title">Vanliga tjänster - Klicka för att lägga till:</h5>
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <div key={category} className="template-category">
              <h6 className="category-name">{category}</h6>
              <div className="template-grid">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => handleAddFromTemplate(template)}
                    className="template-btn"
                    disabled={!!services[template.name]}
                  >
                    <span className="template-name">{template.name}</span>
                    <span className="template-interval">
                      {template.interval_months === 0 
                        ? 'Ingen retention' 
                        : `${template.interval_months} mån`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Services List */}
      {servicesList.length > 0 && (
        <div className="services-list">
          <h5 className="list-title">Aktiva tjänster ({servicesList.length})</h5>
          {servicesList.map((service) => (
            <div key={service.name} className="service-item">
              <div className="service-item-content">
                <div className="service-name-field">
                  <label>Tjänst</label>
                  <div className="service-name-display">{service.name}</div>
                </div>
                <div className="service-interval-field">
                  <label>Retention-intervall</label>
                  <div className="interval-input-group">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={service.interval_months}
                      onChange={(e) => handleUpdateService(service.name, 'interval_months', parseInt(e.target.value) || 0)}
                      className="interval-input"
                    />
                    <span className="interval-unit">månader</span>
                  </div>
                  <small className="interval-hint">
                    {service.interval_months === 0 
                      ? 'Ingen retention-SMS skickas' 
                      : `SMS skickas ${service.interval_months} mån efter besök`}
                  </small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveService(service.name)}
                className="service-remove-btn"
                title="Ta bort tjänst"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Service */}
      <div className="service-add-section">
        <h5 className="add-title">Lägg till egen tjänst</h5>
        <div className="service-add-fields">
          <div className="add-name-field">
            <label>Tjänstens namn</label>
            <input
              type="text"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
              className="service-input"
              placeholder="T.ex. Specialbehandling"
            />
          </div>
          <div className="add-interval-field">
            <label>Retention-intervall</label>
            <div className="interval-input-group">
              <input
                type="number"
                min="0"
                max="12"
                value={newServiceInterval}
                onChange={(e) => setNewServiceInterval(parseInt(e.target.value) || 0)}
                className="interval-input"
              />
              <span className="interval-unit">månader</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddService}
          className="service-add-btn"
          disabled={!newServiceName.trim()}
        >
          <Plus size={18} />
          Lägg till tjänst
        </button>
      </div>

      {servicesList.length === 0 && !showTemplates && (
        <div className="service-empty-state">
          <Scissors size={32} className="empty-icon" />
          <p>Inga tjänster tillagda ännu</p>
          <p className="empty-hint">Klicka på "Visa mallar" eller lägg till egen tjänst</p>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
