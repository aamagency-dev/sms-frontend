import React from 'react';
import ServiceRetentionIntervals from '../components/ServiceRetentionIntervals';
import './BusinessSettings.css';

const BusinessSettings = ({ business }) => {
  return (
    <div className="business-settings">
      <h1>Inställningar för {business.name}</h1>
      
      {/* Other settings sections */}
      <div className="settings-section">
        <h2>Övriga inställningar</h2>
        {/* Your existing settings */}
      </div>
      
      {/* Service Retention Intervals Section */}
      <div className="settings-section">
        <ServiceRetentionIntervals businessId={business.id} />
      </div>
      
      {/* SMS Settings Section */}
      <div className="settings-section">
        <h2>SMS-inställningar</h2>
        {/* Your SMS settings */}
      </div>
    </div>
  );
};

export default BusinessSettings;
