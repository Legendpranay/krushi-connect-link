
import React from 'react';
import { Input } from '@/components/ui/input';

interface PersonalInfoSectionProps {
  formData: {
    name: string;
    village: string;
    district: string;
    state: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  t: (key: string) => string;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ formData, handleChange, t }) => {
  return (
    <>
      {/* Name */}
      <div className="form-input-group">
        <label htmlFor="name" className="form-label">
          {t('profile.name')}*
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Village */}
      <div className="form-input-group">
        <label htmlFor="village" className="form-label">
          {t('profile.village')}*
        </label>
        <Input
          id="village"
          name="village"
          value={formData.village}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* District */}
      <div className="form-input-group">
        <label htmlFor="district" className="form-label">
          {t('profile.district')}*
        </label>
        <Input
          id="district"
          name="district"
          value={formData.district}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* State */}
      <div className="form-input-group">
        <label htmlFor="state" className="form-label">
          {t('profile.state')}*
        </label>
        <Input
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );
};

export default PersonalInfoSection;
