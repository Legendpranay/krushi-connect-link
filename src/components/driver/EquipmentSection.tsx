
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Equipment } from '../../types';

interface EquipmentSectionProps {
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  t: (key: string) => string;
}

const EquipmentSection: React.FC<EquipmentSectionProps> = ({ equipment, setEquipment, t }) => {
  const handleEquipmentChange = (index: number, field: keyof Equipment, value: string | number) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index] = {
      ...updatedEquipment[index],
      [field]: field === 'pricePerAcre' || field === 'pricePerHour' 
        ? parseFloat(value as string) || 0 
        : value
    };
    setEquipment(updatedEquipment);
  };

  const addEquipmentField = () => {
    setEquipment([
      ...equipment,
      { id: `${equipment.length + 1}`, name: '', pricePerAcre: 0 }
    ]);
  };

  const removeEquipmentField = (index: number) => {
    if (equipment.length > 1) {
      setEquipment(equipment.filter((_, i) => i !== index));
    }
  };

  return (
    <>
      <h3 className="text-lg font-semibold mt-8">{t('driver.myServices')}</h3>
      
      {/* Equipment List */}
      {equipment.map((item, index) => (
        <div key={index} className="p-4 border rounded-md">
          <div className="form-input-group">
            <label htmlFor={`equipment-name-${index}`} className="form-label">
              {t('driver.equipmentName')}*
            </label>
            <Input
              id={`equipment-name-${index}`}
              value={item.name}
              onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
              required
            />
          </div>
          
          <div className="form-input-group">
            <label htmlFor={`equipment-price-${index}`} className="form-label">
              {t('driver.pricePerAcre')}*
            </label>
            <Input
              id={`equipment-price-${index}`}
              type="number"
              min="0"
              step="10"
              value={item.pricePerAcre}
              onChange={(e) => handleEquipmentChange(index, 'pricePerAcre', e.target.value)}
              required
            />
          </div>
          
          <div className="form-input-group">
            <label htmlFor={`equipment-hour-price-${index}`} className="form-label">
              {t('driver.pricePerHour')} ({t('common.optional')})
            </label>
            <Input
              id={`equipment-hour-price-${index}`}
              type="number"
              min="0"
              step="10"
              value={item.pricePerHour || ''}
              onChange={(e) => handleEquipmentChange(index, 'pricePerHour', e.target.value)}
            />
          </div>
          
          {equipment.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeEquipmentField(index)}
              className="mt-2"
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addEquipmentField}
        className="w-full"
      >
        + {t('driver.addEquipment')}
      </Button>
    </>
  );
};

export default EquipmentSection;
