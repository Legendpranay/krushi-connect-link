
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Equipment } from '../../types';
import { X, Plus } from 'lucide-react';

interface EquipmentSectionProps {
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  t: (key: string) => string;
}

const EquipmentSection = ({ equipment, setEquipment, t }: EquipmentSectionProps) => {
  
  const handleEquipmentChange = (index: number, field: keyof Equipment, value: any) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index] = {
      ...updatedEquipment[index],
      [field]: field.includes('price') ? Number(value) : value
    };
    setEquipment(updatedEquipment);
  };

  const addEquipmentField = () => {
    setEquipment([...equipment, {
      id: `new-${Date.now()}`,
      name: '',
      pricePerAcre: 0
    }]);
  };

  const removeEquipmentField = (index: number) => {
    const updatedEquipment = [...equipment];
    updatedEquipment.splice(index, 1);
    setEquipment(updatedEquipment);
  };

  return (
    <>
      <h3 className="text-lg font-semibold mt-6 mb-2">Equipment & Services</h3>
      
      <div className="space-y-4">
        {equipment.map((item, index) => (
          <div key={item.id} className="flex space-x-2 items-end">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">
                Equipment/Service*
              </label>
              <Input 
                value={item.name}
                onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                placeholder="e.g. Plowing, Sowing"
                required
              />
            </div>
            
            <div className="w-1/3">
              <label className="block text-gray-700 text-sm mb-1">
                Price/Acre (₹)*
              </label>
              <Input 
                type="number"
                value={item.pricePerAcre}
                onChange={(e) => handleEquipmentChange(index, 'pricePerAcre', e.target.value)}
                min={0}
                required
              />
            </div>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => removeEquipmentField(index)}
              disabled={equipment.length <= 1}
              className="mb-0.5"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEquipmentField}
          className="mt-2 w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add More Equipment
        </Button>
      </div>
    </>
  );
};

export default EquipmentSection;
