
import React from 'react';
import { Input } from '@/components/ui/input';

interface TractorDetailsSectionProps {
  formData: {
    tractorType: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tractorImage: File | null;
  setTractorImage: React.Dispatch<React.SetStateAction<File | null>>;
  licenseImage: File | null;
  setLicenseImage: React.Dispatch<React.SetStateAction<File | null>>;
  t: (key: string) => string;
}

const TractorDetailsSection = ({ 
  formData, 
  handleChange, 
  tractorImage, 
  setTractorImage,
  licenseImage,
  setLicenseImage,
  t 
}: TractorDetailsSectionProps) => {
  
  const handleTractorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTractorImage(e.target.files[0]);
    }
  };
  
  const handleLicenseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseImage(e.target.files[0]);
    }
  };
  
  return (
    <>
      <h3 className="text-lg font-semibold mt-6 mb-2">Tractor Details</h3>
      
      {/* Tractor Type */}
      <div className="form-group mb-4">
        <label htmlFor="tractorType" className="block text-gray-700 mb-1">
          Tractor Type*
        </label>
        <Input 
          id="tractorType" 
          name="tractorType" 
          value={formData.tractorType}
          onChange={handleChange} 
          required 
          className="w-full"
          placeholder="e.g. John Deere 5045D"
        />
      </div>

      {/* Tractor Image */}
      <div className="form-group mb-4">
        <label htmlFor="tractorImage" className="block text-gray-700 mb-1">
          Tractor Photo*
        </label>
        <div className="mb-2">
          {tractorImage && (
            <div className="rounded-md overflow-hidden mb-2 max-h-40">
              <img 
                src={URL.createObjectURL(tractorImage)} 
                alt="Tractor preview" 
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
        <Input 
          type="file"
          id="tractorImage"
          accept="image/*"
          onChange={handleTractorImageChange}
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          Upload a clear photo of your tractor
        </p>
      </div>

      {/* Driving License */}
      <div className="form-group mb-4">
        <label htmlFor="licenseImage" className="block text-gray-700 mb-1">
          Driving License*
        </label>
        <div className="mb-2">
          {licenseImage && (
            <div className="rounded-md overflow-hidden mb-2 max-h-40">
              <img 
                src={URL.createObjectURL(licenseImage)} 
                alt="License preview" 
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
        <Input 
          type="file"
          id="licenseImage"
          accept="image/*"
          onChange={handleLicenseImageChange}
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          Upload a clear photo of your valid driving license
        </p>
      </div>
    </>
  );
};

export default TractorDetailsSection;
