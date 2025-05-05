
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Booking } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const DriverEarningsPage = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch driver's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!userProfile?.id) return;
      
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('driverId', '==', userProfile.id),
          orderBy('requestedTime', 'desc')
        );
        const snapshot = await getDocs(q);
        
        const bookingsList: Booking[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          bookingsList.push({
            id: doc.id,
            ...data,
            requestedTime: data.requestedTime?.toDate?.() || new Date(data.requestedTime),
            scheduledTime: data.scheduledTime?.toDate?.() || (data.scheduledTime ? new Date(data.scheduledTime) : undefined),
            completedTime: data.completedTime?.toDate?.() || (data.completedTime ? new Date(data.completedTime) : undefined),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
            paymentDueDate: data.paymentDueDate?.toDate?.() || (data.paymentDueDate ? new Date(data.paymentDueDate) : undefined)
          } as Booking);
        });
        
        setBookings(bookingsList);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userProfile?.id) {
      fetchBookings();
    } else {
      setIsLoading(false); // Make sure we stop loading even if no user profile
    }
  }, [userProfile]);

  // Calculate earnings stats - always default to 0
  const totalEarnings = bookings
    .filter(booking => booking.status === 'completed' || booking.status === 'awaiting_payment')
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  
  const paidEarnings = bookings
    .filter(booking => booking.status === 'completed' && booking.paymentStatus === 'paid')
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  
  const pendingEarnings = bookings
    .filter(booking => booking.paymentStatus === 'pending')
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  
  // Get last 30 days of earnings for chart
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const earningsData = last30Days.map(date => {
    const dayEarnings = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.completedTime || booking.requestedTime);
        return bookingDate.toISOString().split('T')[0] === date && 
               (booking.status === 'completed' || booking.status === 'awaiting_payment');
      })
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    return {
      date: date.split('-').slice(1).join('/'), // Format as MM/DD
      earnings: dayEarnings
    };
  });

  // Group bookings by payment status
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  const pendingPaymentBookings = bookings.filter(booking => 
    (booking.status === 'completed' || booking.status === 'awaiting_payment') && booking.paymentStatus === 'pending'
  );

  // Loading skeleton for earnings summary
  const renderEarningsSummarySkeleton = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Loading skeleton for chart
  const renderChartSkeleton = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );

  return (
    <UserContainer>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">{t('driver.earnings')}</h2>
        
        {isLoading ? (
          <>
            {renderEarningsSummarySkeleton()}
            {renderChartSkeleton()}
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-16 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Earnings Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">₹{totalEarnings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-600">₹{paidEarnings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">₹{pendingEarnings}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Earnings Chart */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Earnings (Last 30 Days)</h3>
                {earningsData.some(item => item.earnings > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Earnings']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="earnings" name="Earnings (₹)" fill="#6366F1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">No earnings data available for this period</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Pending Payments */}
            {pendingPaymentBookings.length > 0 ? (
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-4">Pending Payments</h3>
                <div className="space-y-3">
                  {pendingPaymentBookings.map(booking => (
                    <Card key={booking.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{booking.serviceType}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.requestedTime).toLocaleDateString()} • {booking.acreage} acres
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{booking.totalPrice}</p>
                            <p className="text-xs text-amber-600">Payment pending</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-4">Pending Payments</h3>
                <div className="text-center p-6 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No pending payments</p>
                </div>
              </div>
            )}
            
            {/* Completed Jobs */}
            {completedBookings.length > 0 ? (
              <div>
                <h3 className="font-medium text-lg mb-4">Completed Jobs</h3>
                <div className="space-y-3">
                  {completedBookings.slice(0, 5).map(booking => (
                    <Card key={booking.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{booking.serviceType}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.completedTime || booking.requestedTime).toLocaleDateString()} • {booking.acreage} acres
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{booking.totalPrice}</p>
                            <p className={`text-xs ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                              {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-lg mb-4">Completed Jobs</h3>
                <div className="text-center p-6 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">You haven't completed any jobs yet</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserContainer>
  );
};

export default DriverEarningsPage;
