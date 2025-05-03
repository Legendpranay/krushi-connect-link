
import React from 'react';
import { BookingStatus as BookingStatusType } from '@/types';
import { Badge } from '@/components/ui/badge';

interface BookingStatusProps {
  status: BookingStatusType;
}

const BookingStatus: React.FC<BookingStatusProps> = ({ status }) => {
  // Define color based on status
  let badgeVariant: 
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'success'
    | 'warning' = 'default';
  
  // Map status to color and text
  switch (status) {
    case 'requested':
      badgeVariant = 'warning';
      break;
    case 'accepted':
      badgeVariant = 'secondary';
      break;
    case 'in_progress':
      badgeVariant = 'default';
      break;
    case 'completed':
      badgeVariant = 'success';
      break;
    case 'canceled':
      badgeVariant = 'destructive';
      break;
    case 'rejected':
      badgeVariant = 'destructive';
      break;
    case 'awaiting_payment':
      badgeVariant = 'outline';
      break;
    default:
      badgeVariant = 'default';
  }
  
  // Format status for display (convert snake_case to Title Case)
  const formattedStatus = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return (
    <Badge variant={badgeVariant}>
      {formattedStatus}
    </Badge>
  );
};

export default BookingStatus;
