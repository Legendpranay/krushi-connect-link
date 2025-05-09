
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const SimplifiedRoleSelector = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      <Card className="border hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <path d="M3 16V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5c-1.1 0-2-.9-2-2Z" />
                <path d="M18 14H6" />
                <path d="M9 18h6" />
                <path d="M10 6h4" />
                <path d="M8 10h8" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">{t('roleSelection.farmer')}</h3>
            <p className="text-gray-600 mb-4">
              {t('roleSelection.farmerDescription')}
            </p>
            <Button
              onClick={() => navigate('/complete-farmer-profile')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {t('roleSelection.selectFarmer')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">{t('roleSelection.driver')}</h3>
            <p className="text-gray-600 mb-4">
              {t('roleSelection.driverDescription')}
            </p>
            <div className="space-y-2 w-full">
              <Button
                onClick={() => navigate('/complete-driver-profile')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {t('roleSelection.selectDriver')} (Full Profile)
              </Button>
              <Button
                onClick={() => navigate('/driver-registration')}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Quick Registration (Basic Info Only)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedRoleSelector;
