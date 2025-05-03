
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DriverProfile, FarmerProfile, Booking } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Users, 
  Tractor, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Admin sub-pages
import AdminDrivers from './AdminDrivers';
import AdminFarmers from './AdminFarmers';
import AdminBookings from './AdminBookings';

const AdminDashboardPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDrivers: 0,
    pendingDrivers: 0,
    totalFarmers: 0,
    activeBookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  // Redirect if not admin
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  if (userProfile?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setIsLoading(true);
        
        // Get total drivers count
        const driversRef = collection(db, 'users');
        const driversQuery = query(driversRef, where('role', '==', 'driver'));
        const driversSnapshot = await getDocs(driversQuery);
        const totalDrivers = driversSnapshot.size;
        
        // Get pending drivers count
        const pendingDriversQuery = query(
          driversRef, 
          where('role', '==', 'driver'),
          where('isVerified', '==', false)
        );
        const pendingDriversSnapshot = await getDocs(pendingDriversQuery);
        const pendingDrivers = pendingDriversSnapshot.size;

        // Get total farmers count
        const farmersQuery = query(driversRef, where('role', '==', 'farmer'));
        const farmersSnapshot = await getDocs(farmersQuery);
        const totalFarmers = farmersSnapshot.size;

        // Get active bookings count
        const bookingsRef = collection(db, 'bookings');
        const activeBookingsQuery = query(
          bookingsRef,
          where('status', 'in', ['requested', 'accepted', 'in_progress'])
        );
        const activeBookingsSnapshot = await getDocs(activeBookingsQuery);
        const activeBookings = activeBookingsSnapshot.size;

        // Get recent bookings
        const recentBookingsQuery = query(
          bookingsRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        const recentBookingsList: Booking[] = [];
        
        for (const doc of recentBookingsSnapshot.docs) {
          const booking = doc.data() as Booking;
          recentBookingsList.push({
            id: doc.id,
            ...booking
          });
        }
        
        setRecentBookings(recentBookingsList);
        setStats({
          totalDrivers,
          pendingDrivers,
          totalFarmers,
          activeBookings
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin dashboard data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AgroConnect Admin</h1>
          </div>
          <nav className="space-x-4">
            <Link to="/admin" className="text-primary hover:underline">Dashboard</Link>
            <Link to="/admin/drivers" className="text-gray-600 hover:underline">Drivers</Link>
            <Link to="/admin/farmers" className="text-gray-600 hover:underline">Farmers</Link>
            <Link to="/admin/bookings" className="text-gray-600 hover:underline">Bookings</Link>
            <Link to="/" className="text-gray-600 hover:underline">Exit Admin</Link>
          </nav>
        </div>
      </header>
      
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Drivers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Tractor className="h-5 w-5 text-primary mr-2" />
                      <span className="text-2xl font-bold">{stats.totalDrivers}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Pending Verifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-2xl font-bold">{stats.pendingDrivers}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Farmers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-2xl font-bold">{stats.totalFarmers}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Active Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-2xl font-bold">{stats.activeBookings}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Actions */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate('/admin/drivers?filter=pending')}>
                    Review Pending Drivers
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/admin/bookings')}>
                    Manage Bookings
                  </Button>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {booking.id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.serviceType}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                booking.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : booking.status === 'canceled' || booking.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.status === 'requested'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(booking.requestedTime).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/bookings/${booking.id}`)}>
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {recentBookings.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center">
                              No recent bookings found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          } />
          <Route path="/drivers" element={<AdminDrivers />} />
          <Route path="/farmers" element={<AdminFarmers />} />
          <Route path="/bookings" element={<AdminBookings />} />
          <Route path="/bookings/:bookingId" element={<div>Booking Details</div>} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
