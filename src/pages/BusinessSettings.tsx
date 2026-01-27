import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import './BusinessSettings.css';

interface Business {
  id: string;
  name: string;
  bokadirekt_url?: string;
  tone_of_voice?: string;
  google_review_link?: string;
  sms_sender_name?: string;
  org_number?: string;
  billing_address?: string;
  vat_number?: string;
}

interface BusinessSettingsProps {
  business: Business;
  onUpdate?: (business: Business) => void;
}

const BusinessSettings: React.FC<BusinessSettingsProps> = ({ business, onUpdate }) => {
  const [formData, setFormData] = useState<Business>(business);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFormData(business);
  }, [business]);

  const handleChange = (field: keyof Business, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty is OK
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    // Validate URLs
    if (formData.bokadirekt_url && !validateUrl(formData.bokadirekt_url)) {
      setErrorMessage('Ogiltig Boka Direkt URL');
      setSaveStatus('error');
      return;
    }
    if (formData.google_review_link && !validateUrl(formData.google_review_link)) {
      setErrorMessage('Ogiltig Google Review URL');
      setSaveStatus('error');
      return;
    }

    setSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/businesses/${business.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bokadirekt_url: formData.bokadirekt_url,
          tone_of_voice: formData.tone_of_voice,
          google_review_link: formData.google_review_link,
          sms_sender_name: formData.sms_sender_name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSaveStatus('success');
      if (onUpdate) {
        onUpdate(formData);
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Kunde inte spara inställningar');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="business-settings">
      <div className="settings-header">
        <h1>Inställningar för {business.name}</h1>
        <p className="settings-subtitle">Konfigurera ditt företags SMS-system</p>
      </div>

      {/* Boka Direkt Integration */}
      <div className="settings-section">
        <h2>🔗 Boka Direkt Integration</h2>
        <p className="section-description">
          Länk till din Boka Direkt-sida som skickas till kunder när de vill boka tid
        </p>
        
        <div className="form-group">
          <label htmlFor="bokadirekt_url">Boka Direkt URL</label>
          <input
            id="bokadirekt_url"
            type="url"
            className="form-control"
            placeholder="https://www.bokadirekt.se/places/din-salong-12345"
            value={formData.bokadirekt_url || ''}
            onChange={(e) => handleChange('bokadirekt_url', e.target.value)}
          />
          <small className="form-hint">
            Exempel: https://www.bokadirekt.se/places/din-salong-12345
          </small>
        </div>
      </div>

      {/* Google Review Link */}
      <div className="settings-section">
        <h2>⭐ Google Review</h2>
        <p className="section-description">
          Länk till din Google-recension som skickas till nöjda kunder
        </p>
        
        <div className="form-group">
          <label htmlFor="google_review_link">Google Review URL</label>
          <input
            id="google_review_link"
            type="url"
            className="form-control"
            placeholder="https://g.page/r/..."
            value={formData.google_review_link || ''}
            onChange={(e) => handleChange('google_review_link', e.target.value)}
          />
          <small className="form-hint">
            Hitta din review-länk på Google My Business
          </small>
        </div>
      </div>

      {/* Billing Information */}
      <div className="settings-section">
        <h2>💳 Faktureringsinformation</h2>
        <p className="section-description">
          Information för fakturering och bokföring
        </p>
        
        <div className="form-group">
          <label htmlFor="org_number">Organisationsnummer</label>
          <input
            id="org_number"
            type="text"
            className="form-control"
            placeholder="XXXXXX-XXXX"
            value={formData.org_number || ''}
            onChange={(e) => handleChange('org_number', e.target.value)}
          />
          <small className="form-hint">
            Företagets organisationsnummer
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="vat_number">Momsregistreringsnummer</label>
          <input
            id="vat_number"
            type="text"
            className="form-control"
            placeholder="SE123456789001"
            value={formData.vat_number || ''}
            onChange={(e) => handleChange('vat_number', e.target.value)}
          />
          <small className="form-hint">
            Momsreg.nr (om momsregistrerad)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="billing_address">Fakturaadress</label>
          <textarea
            id="billing_address"
            className="form-control"
            rows={3}
            placeholder="Gatuadress&#10;Postnummer Ort"
            value={formData.billing_address || ''}
            onChange={(e) => handleChange('billing_address', e.target.value)}
          />
          <small className="form-hint">
            Fullständig fakturaadress
          </small>
        </div>
      </div>

      {/* SMS Settings */}
      <div className="settings-section">
        <h2>💬 SMS-inställningar</h2>
        <p className="section-description">
          Anpassa hur dina SMS-meddelanden ser ut
        </p>
        
        <div className="form-group">
          <label htmlFor="tone_of_voice">Standard Tonalitet (Fallback)</label>
          <select
            id="tone_of_voice"
            className="form-control"
            value={formData.tone_of_voice || 'Proffsig'}
            onChange={(e) => handleChange('tone_of_voice', e.target.value)}
          >
            <option value="Jessica-tonen">Jessica-tonen (Varm, "haha" 😍✨)</option>
            <option value="Proffsig">Proffsig (Artig, korrekt men varm)</option>
            <option value="Kaxig/Barberare">Kaxig/Barberare (Rapp, slang 👊)</option>
            <option value="Klassisk/Gunilla">Klassisk/Gunilla (Vårdat, mjukt ❤️)</option>
            <option value="Spirituell/Eko">Spirituell/Eko (Lugn, mjuk 🌱)</option>
            <option value="Trendig/Peppig">Trendig/Peppig (Entusiastisk 🔥✨)</option>
          </select>
          <small className="form-hint">
            Används när ingen specifik frisör är angiven för kunden
          </small>
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-actions">
        <button
          className={`btn-primary ${saving ? 'btn-loading' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner"></span>
              Sparar...
            </>
          ) : (
            <>
              <Save size={18} />
              Spara inställningar
            </>
          )}
        </button>

        {saveStatus === 'success' && (
          <div className="status-message success">
            <CheckCircle size={18} />
            Inställningar sparade!
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="status-message error">
            <AlertCircle size={18} />
            {errorMessage || 'Kunde inte spara inställningar'}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="info-box">
        <AlertCircle size={20} />
        <div>
          <strong>Tips:</strong> Dessa inställningar påverkar alla SMS som skickas från systemet.
          Se till att länkarna är korrekta innan du sparar.
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
