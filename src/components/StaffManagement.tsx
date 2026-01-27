import React, { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import './StaffManagement.css';

interface StaffMember {
  id?: string;
  name: string;
  tone_of_voice: string;
  is_active: boolean;
}

interface StaffManagementProps {
  staffMembers: StaffMember[];
  onChange: (staff: StaffMember[]) => void;
}

const TONE_OPTIONS = [
  { value: 'Jessica-tonen', label: 'Jessica-tonen (Varm, "haha" 😍✨)' },
  { value: 'Proffsig', label: 'Proffsig (Artig, korrekt men varm)' },
  { value: 'Kaxig/Barberare', label: 'Kaxig/Barberare (Rapp, slang 👊)' },
  { value: 'Klassisk/Gunilla', label: 'Klassisk/Gunilla (Vårdat, mjukt ❤️)' },
  { value: 'Spirituell/Eko', label: 'Spirituell/Eko (Lugn, mjuk 🌱)' },
  { value: 'Trendig/Peppig', label: 'Trendig/Peppig (Entusiastisk 🔥✨)' }
];

const StaffManagement: React.FC<StaffManagementProps> = ({ staffMembers, onChange }) => {
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffTone, setNewStaffTone] = useState('Proffsig');

  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;

    const newStaff: StaffMember = {
      name: newStaffName.trim(),
      tone_of_voice: newStaffTone,
      is_active: true
    };

    onChange([...staffMembers, newStaff]);
    setNewStaffName('');
    setNewStaffTone('Proffsig');
  };

  const handleRemoveStaff = (index: number) => {
    const updated = staffMembers.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateStaff = (index: number, field: keyof StaffMember, value: string) => {
    const updated = [...staffMembers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="staff-management">
      <div className="staff-header">
        <h4 className="staff-title">
          <User size={18} />
          Personal på salongen
        </h4>
        <p className="staff-subtitle">
          Lägg till frisörer/personal med individuell tonalitet för SMS. Används även för prissättning.
        </p>
      </div>

      {/* Existing Staff List */}
      {staffMembers.length > 0 && (
        <div className="staff-list">
          {staffMembers.map((staff, index) => (
            <div key={index} className="staff-item">
              <div className="staff-item-content">
                <div className="staff-field">
                  <label>Namn</label>
                  <input
                    type="text"
                    value={staff.name}
                    onChange={(e) => handleUpdateStaff(index, 'name', e.target.value)}
                    className="staff-input"
                    placeholder="T.ex. Jessica"
                  />
                </div>
                <div className="staff-field">
                  <label>Tonalitet</label>
                  <select
                    value={staff.tone_of_voice}
                    onChange={(e) => handleUpdateStaff(index, 'tone_of_voice', e.target.value)}
                    className="staff-select"
                  >
                    {TONE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveStaff(index)}
                className="staff-remove-btn"
                title="Ta bort personal"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Staff */}
      <div className="staff-add-section">
        <div className="staff-add-fields">
          <div className="staff-field">
            <label>Namn på ny personal</label>
            <input
              type="text"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStaff()}
              className="staff-input"
              placeholder="T.ex. Jessica"
            />
          </div>
          <div className="staff-field">
            <label>Tonalitet</label>
            <select
              value={newStaffTone}
              onChange={(e) => setNewStaffTone(e.target.value)}
              className="staff-select"
            >
              {TONE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddStaff}
          className="staff-add-btn"
          disabled={!newStaffName.trim()}
        >
          <Plus size={18} />
          Lägg till personal
        </button>
      </div>

      <div className="staff-info">
        <strong>Antal personal:</strong> {staffMembers.length}
        {staffMembers.length > 0 && (
          <span className="staff-pricing-note">
            (Används för prissättning - pris per frisör)
          </span>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
