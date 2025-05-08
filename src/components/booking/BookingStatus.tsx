
import React from 'react';
import { BookingStatus as BookingStatusType } from '../../types';
import { Badge } from '@/components/ui/badge';
import { cva } from 'class-variance-authority';

// Extend the badge variants to include success and warning
const extendedBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600", 
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

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
    case 'cancelled':
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
    <div className={extendedBadgeVariants({ variant: badgeVariant })}>
      {formattedStatus}
    </div>
  );
};

export default BookingStatus;
