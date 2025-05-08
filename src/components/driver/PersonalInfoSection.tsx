
import React from 'react';
import { Input } from '@/components/ui/input';

interface PersonalInfoSectionProps {
  formData: {
    name: string;
    village: string;
    district: string;
    state: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

const PersonalInfoSection = ({ formData, handleChange, t }: PersonalInfoSectionProps) => {
  return (
    <>
      {/* Name */}
      <div className="form-group">
        <label htmlFor="name" className="block text-gray-700 mb-1">
          Full Name*
        </label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name}
          onChange={handleChange} 
          required 
          className="w-full"
        />
      </div>

      {/* Village */}
      <div className="form-group">
        <label htmlFor="village" className="block text-gray-700 mb-1">
          Village*
        </label>
        <Input 
          id="village" 
          name="village" 
          value={formData.village}
          onChange={handleChange} 
          required 
          className="w-full"
        />
      </div>

      {/* District */}
      <div className="form-group">
        <label htmlFor="district" className="block text-gray-700 mb-1">
          District*
        </label>
        <Input 
          id="district" 
          name="district" 
          value={formData.district}
          onChange={handleChange} 
          required 
          className="w-full"
        />
      </div>

      {/* State */}
      <div className="form-group">
        <label htmlFor="state" className="block text-gray-700 mb-1">
          State*
        </label>
        <Input 
          id="state" 
          name="state" 
          value={formData.state}
          onChange={handleChange} 
          required 
          className="w-full"
        />
      </div>
    </>
  );
};

export default PersonalInfoSection;
