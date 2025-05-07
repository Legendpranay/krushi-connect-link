
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Calendar, User, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const BottomNavigation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const currentPath = location.pathname;

  // Navigation items with their icons, labels, and paths
  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
    },
    {
      icon: Map,
      label: 'Map',
      path: '/map',
    },
    {
      icon: Calendar,
      label: 'Bookings',
      path: '/bookings',
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
    },
    {
      icon: MoreHorizontal,
      label: 'More',
      path: '/more',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 h-16 z-50">
      <div className="max-w-md mx-auto h-full">
        <div className="flex justify-between h-full">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-nav-item ${
                  isActive ? 'text-primary-500' : 'text-gray-500'
                }`}
              >
                <item.icon className="bottom-nav-icon" />
                <span className="bottom-nav-text">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
