
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Equipment } from '../types';
import { Plus, X, Save, Edit, Tractor, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

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

  if (!userProfile) {
    return (
      <UserContainer>
        <div className="p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Please log in to manage your services</p>
              <Button className="mt-4" onClick={() => navigate('/auth')}>
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </UserContainer>
    );
  }

  return (
    <UserContainer>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('driver.myServices')}</h2>
          {!isAddingNew && !editingId && (
            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary-600">
              <Plus size={16} className="mr-2" /> Add Service
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-x-2">
                      <Skeleton className="h-9 w-9 rounded-md inline-block" />
                      <Skeleton className="h-9 w-9 rounded-md inline-block" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add/Edit Form */}
            {(isAddingNew || editingId) && (
              <Card className="border-primary border-2">
                <CardHeader className="bg-primary/5 pb-2">
                  <CardTitle className="text-lg">
                    {isAddingNew ? 'Add New Service' : 'Edit Service'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
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
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X size={16} className="mr-2" /> Cancel
                      </Button>
                      <Button onClick={handleSave} className="bg-primary hover:bg-primary-600">
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
                <Card key={item.id} className="shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Tractor className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm">
                            <span className="font-medium">₹{item.pricePerAcre}</span> per acre
                            {item.pricePerHour ? ` • ₹${item.pricePerHour} per hour` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(item)}
                          disabled={!!editingId || isAddingNew}
                          className="border-primary text-primary hover:bg-primary/10"
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
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No services found</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't added any services yet. Add your first service to start getting bookings.
                  </p>
                  <Button 
                    variant="default" 
                    onClick={handleAddNew} 
                    className="mt-2 bg-primary hover:bg-primary-600"
                  >
                    <Plus size={16} className="mr-2" /> Add your first service
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </UserContainer>
  );
};

export default DriverServicesPage;
