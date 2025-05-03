
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Booking } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from '@/components/ui/use-toast';
import { Search, Check, X, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const bookingsList: Booking[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Booking;
        bookingsList.push({
          id: doc.id,
          ...data,
        });
      });
      
      setBookings(bookingsList);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(query) ||
        booking.farmerId.toLowerCase().includes(query) ||
        booking.driverId.toLowerCase().includes(query) ||
        booking.address.toLowerCase().includes(query) ||
        booking.serviceType.toLowerCase().includes(query)
      );
    }
    
    setFilteredBookings(filtered);
  };

  const handleSendReminder = async (booking: Booking) => {
    try {
      // Here you would typically send a notification or create a reminder in Firestore
      // For now we'll just update the booking record with a reminder count
      const bookingRef = doc(db, 'bookings', booking.id);
      
      // Create/update reminder data
      await updateDoc(bookingRef, {
        'reminderCount': (booking.reminderCount || 0) + 1,
        'lastReminderSent': new Date()
      });
      
      toast({
        description: 'Payment reminder sent successfully.'
      });
      
      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading bookings...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {booking.serviceType} ({booking.acreage} acres)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(booking.requestedTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      booking.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'canceled' || booking.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : booking.status === 'requested'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'awaiting_payment'
                        ? 'bg-purple-100 text-purple-800'  
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      booking.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm max-w-xs truncate">
                    {booking.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                    >
                      View
                    </Button>
                    
                    {booking.status === 'completed' && booking.paymentStatus === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendReminder(booking)}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Remind
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p>No bookings found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
