
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BottomNavigation from './BottomNavigation';

interface UserContainerProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}

const UserContainer = ({ children, hideBottomNav = false }: UserContainerProps) => {
  const { isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <main className="page-container">
        {children}
      </main>
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};

export default UserContainer;
