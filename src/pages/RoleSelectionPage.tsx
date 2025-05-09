
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import RoleSelectionForm from '../components/RoleSelectionForm';

const RoleSelectionPage = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if user already has a role
    if (userProfile?.role) {
      navigate('/');
    }
    
    // Redirect to auth if user is not logged in
    if (!userProfile) {
      navigate('/auth');
    }
  }, [userProfile, navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">{t('roleSelection.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('roleSelection.description')}
        </p>
      </div>

      <RoleSelectionForm />
    </div>
  );
};

export default RoleSelectionPage;
