
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Booking, BookingStatus } from '../types';

const BookingsPage = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<{
    upcoming: Booking[];
    completed: Booking[];
    pending: Booking[];
  }>({
    upcoming: [],
    completed: [],
    pending: []
  });

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userProfile) return;

      try {
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsRef,
          userProfile.role === 'farmer'
            ? where('farmerId', '==', userProfile.id)
            : where('driverId', '==', userProfile.id)
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const allBookings: Booking[] = [];
        
        bookingsSnapshot.forEach(doc => {
          allBookings.push({ id: doc.id, ...doc.data() } as Booking);
        });
        
        // Group bookings by status
        const grouped = {
          upcoming: allBookings.filter(booking => 
            booking.status === 'accepted' || 
            booking.status === 'in_progress'
          ),
          completed: allBookings.filter(booking => 
            booking.status === 'completed'
          ),
          pending: allBookings.filter(booking => 
            booking.status === 'requested' || 
            booking.status === 'awaiting_payment'
          )
        };
        
        setBookings(grouped);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [userProfile]);

  const renderBookingCard = (booking: Booking) => {
    const date = new Date(booking.requestedTime.toString()).toLocaleDateString();
    const time = new Date(booking.requestedTime.toString()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <Card key={booking.id} className="mb-4 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium">{booking.serviceType}</h4>
            <div className={`px-2 py-1 text-xs rounded-full ${
              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
              booking.status === 'awaiting_payment' ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              booking.status === 'requested' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {booking.status.replace('_', ' ')}
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{date}</span>
              <Clock className="h-4 w-4 ml-4 mr-2" />
              <span>{time}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{booking.address}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <span className="text-gray-600">{booking.acreage} acres</span>
              <span className="mx-2">•</span>
              <span className="font-medium">₹{booking.totalPrice}</span>
              {booking.paymentStatus !== 'paid' && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                  {booking.paymentStatus}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/booking/${booking.id}`)}
            >
              {t('bookings.bookingDetails')}
            </Button>
            
            {booking.status === 'requested' && userProfile?.role === 'driver' && (
              <Button size="sm">
                {t('common.confirm')}
              </Button>
            )}
            
            {booking.status === 'completed' && booking.paymentStatus === 'pending' && (
              userProfile?.role === 'farmer' ? (
                <Button size="sm">
                  {t('bookings.markComplete')}
                </Button>
              ) : (
                <Button size="sm">
                  {t('bookings.sendReminder')}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <UserContainer>
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('bookings.myBookings')}</h2>

        <Tabs defaultValue="upcoming">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">{t('bookings.upcoming')}</TabsTrigger>
            <TabsTrigger value="completed">{t('bookings.completed')}</TabsTrigger>
            <TabsTrigger value="pending">{t('bookings.pending')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {bookings.upcoming.length > 0 ? (
              bookings.upcoming.map(booking => renderBookingCard(booking))
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">{t('bookings.upcoming')} {t('bookings.myBookings')} {t('common.loading')}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {bookings.completed.length > 0 ? (
              bookings.completed.map(booking => renderBookingCard(booking))
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">{t('bookings.completed')} {t('bookings.myBookings')} {t('common.loading')}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {bookings.pending.length > 0 ? (
              bookings.pending.map(booking => renderBookingCard(booking))
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">{t('bookings.pending')} {t('bookings.myBookings')} {t('common.loading')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </UserContainer>
  );
};

export default BookingsPage;
