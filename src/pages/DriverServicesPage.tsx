
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Equipment } from '../types';
import { Plus, X, Save, Edit } from 'lucide-react';

const DriverServicesPage = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Equipment>({
    id: '',
    name: '',
    pricePerAcre: 0,
    pricePerHour: 0
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch driver's equipment
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!userProfile?.id) return;
      
      try {
        const equipmentRef = collection(db, 'equipment');
        const q = query(equipmentRef, where('driverId', '==', userProfile.id));
        const snapshot = await getDocs(q);
        
        const equipmentList: Equipment[] = [];
        snapshot.forEach((doc) => {
          equipmentList.push({
            id: doc.id,
            ...(doc.data() as Omit<Equipment, 'id'>)
          });
        });
        
        setEquipment(equipmentList);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your services. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEquipment();
  }, [userProfile]);

  const handleEdit = (item: Equipment) => {
    setEditingId(item.id);
    setEditForm({
      id: item.id,
      name: item.name,
      pricePerAcre: item.pricePerAcre,
      pricePerHour: item.pricePerHour || 0
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setEditForm({
      id: '',
      name: '',
      pricePerAcre: 0,
      pricePerHour: 0
    });
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setEditForm({
      id: 'new',
      name: '',
      pricePerAcre: 0,
      pricePerHour: 0
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    if (!userProfile?.id) return;
    
    try {
      // Validate form
      if (!editForm.name || editForm.pricePerAcre <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a service name and price per acre.',
          variant: 'destructive',
        });
        return;
      }
      
      if (isAddingNew) {
        // Add new equipment
        const docRef = await addDoc(collection(db, 'equipment'), {
          name: editForm.name,
          pricePerAcre: editForm.pricePerAcre,
          pricePerHour: editForm.pricePerHour || null,
          driverId: userProfile.id,
          createdAt: new Date()
        });
        
        setEquipment([
          ...equipment,
          { ...editForm, id: docRef.id }
        ]);
        
        toast({
          description: 'Service added successfully'
        });
      } else if (editingId) {
        // Update existing equipment
        const equipmentRef = doc(db, 'equipment', editingId);
        await updateDoc(equipmentRef, {
          name: editForm.name,
          pricePerAcre: editForm.pricePerAcre,
          pricePerHour: editForm.pricePerHour || null,
          updatedAt: new Date()
        });
        
        setEquipment(equipment.map(item => 
          item.id === editingId ? { ...editForm } : item
        ));
        
        toast({
          description: 'Service updated successfully'
        });
      }
      
      // Reset form
      handleCancelEdit();
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save service. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'equipment', id));
      setEquipment(equipment.filter(item => item.id !== id));
      toast({
        description: 'Service deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <UserContainer>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('driver.myServices')}</h2>
          {!isAddingNew && !editingId && (
            <Button onClick={handleAddNew}>
              <Plus size={16} className="mr-2" /> Add Service
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add/Edit Form */}
            {(isAddingNew || editingId) && (
              <Card className="border-primary border-2">
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-4">
                    {isAddingNew ? 'Add New Service' : 'Edit Service'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Service Name*
                      </label>
                      <Input
                        name="name"
                        value={editForm.name}
                        onChange={handleChange}
                        placeholder="e.g., Plowing, Harvesting"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price per Acre (₹)*
                      </label>
                      <Input
                        name="pricePerAcre"
                        type="number"
                        min="0"
                        step="10"
                        value={editForm.pricePerAcre}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price per Hour (₹) (Optional)
                      </label>
                      <Input
                        name="pricePerHour"
                        type="number"
                        min="0"
                        step="10"
                        value={editForm.pricePerHour || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X size={16} className="mr-2" /> Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save size={16} className="mr-2" /> Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Service List */}
            {equipment.length > 0 ? (
              equipment.map(item => (
                <Card key={item.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm">
                          <span className="font-medium">₹{item.pricePerAcre}</span> per acre
                          {item.pricePerHour ? ` • ₹${item.pricePerHour} per hour` : ''}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(item)}
                          disabled={!!editingId || isAddingNew}
                        >
                          <Edit size={16} /> 
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(item.id)}
                          disabled={!!editingId || isAddingNew}
                        >
                          <X size={16} /> 
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : !isAddingNew ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p>You haven't added any services yet.</p>
                <Button 
                  variant="outline" 
                  onClick={handleAddNew} 
                  className="mt-4"
                >
                  <Plus size={16} className="mr-2" /> Add your first service
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </UserContainer>
  );
};

export default DriverServicesPage;
