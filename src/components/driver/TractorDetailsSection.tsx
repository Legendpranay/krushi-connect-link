
import React from 'react';
import { Input } from '@/components/ui/input';

interface TractorDetailsSectionProps {
  formData: {
    tractorType: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  tractorImage: File | null;
  setTractorImage: React.Dispatch<React.SetStateAction<File | null>>;
  licenseImage: File | null;
  setLicenseImage: React.Dispatch<React.SetStateAction<File | null>>;
  t: (key: string) => string;
}

const TractorDetailsSection: React.FC<TractorDetailsSectionProps> = ({
  formData,
  handleChange,
  tractorImage,
  setTractorImage,
  licenseImage,
  setLicenseImage,
  t
}) => {
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
      <h3 className="text-lg font-semibold mt-8">{t('driver.tractorDetails')}</h3>
      
      {/* Tractor Type */}
      <div className="form-input-group">
        <label htmlFor="tractorType" className="form-label">
          {t('driver.tractorType')}*
        </label>
        <Input
          id="tractorType"
          name="tractorType"
          value={formData.tractorType}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Tractor Image */}
      <div className="form-input-group">
        <label htmlFor="tractorImage" className="form-label">
          {t('driver.tractorPhoto')}*
        </label>
        <div className="mt-2">
          {tractorImage && (
            <div className="relative h-36 w-full rounded overflow-hidden">
              <img
                src={URL.createObjectURL(tractorImage)}
                alt="Tractor Preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          <Input
            id="tractorImage"
            type="file"
            accept="image/*"
            onChange={handleTractorImageChange}
            className="mt-2"
            required
          />
        </div>
      </div>
      
      {/* License Image */}
      <div className="form-input-group">
        <label htmlFor="licenseImage" className="form-label">
          {t('driver.drivingLicense')}*
        </label>
        <div className="mt-2">
          {licenseImage && (
            <div className="relative h-36 w-full rounded overflow-hidden">
              <img
                src={URL.createObjectURL(licenseImage)}
                alt="License Preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          <Input
            id="licenseImage"
            type="file"
            accept="image/*"
            onChange={handleLicenseImageChange}
            className="mt-2"
            required
          />
        </div>
      </div>
    </>
  );
};

export default TractorDetailsSection;
