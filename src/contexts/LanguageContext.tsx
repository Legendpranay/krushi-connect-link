
import React, { createContext, useContext, useState, useEffect } from 'react';

// Available languages
type Language = 'en' | 'hi';

// Context type definition
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'Krushi Connect',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.completeProfile': 'Complete Your Profile',
    'auth.selectRole': 'Select Your Role',
    'auth.farmer': 'Farmer',
    'auth.driver': 'Driver',
    'role.farmer': 'Farmer',
    'role.driver': 'Driver',
    'role.farmerDesc': 'Book machinery for your farm',
    'role.driverDesc': 'Provide machinery services',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.saved': 'Saved',
    'common.saving': 'Saving...',
    'common.loading': 'Loading...',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.name': 'Name',
    'common.village': 'Village',
    'common.district': 'District',
    'common.phone': 'Phone Number',
    'booking.acreage': 'Farm Size',
    'profile.name': 'Full Name',
    'profile.village': 'Village',
    'profile.district': 'District',
    'profile.state': 'State',
    'profile.editProfile': 'Edit Profile',
    'profile.selectFarmLocation': 'Select your farm location on the map',
    'profile.locationSelected': 'Location selected',
    'driver.uploadPhoto': 'Upload Photo',
    'driver.status': 'Status',
    'driver.online': 'Online',
    'driver.offline': 'Offline',
    'map.nearbyDrivers': 'Nearby Drivers',
    'map.searchLocation': 'Search location...',
    'map.viewProfile': 'View Profile',
    'map.book': 'Book',
  },
  hi: {
    'app.name': 'कृषि कनेक्ट',
    'auth.signIn': 'साइन इन करें',
    'auth.signUp': 'साइन अप करें',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.noAccount': "खाता नहीं है?",
    'auth.hasAccount': 'पहले से ही एक खाता है?',
    'auth.completeProfile': 'अपना प्रोफ़ाइल पूरा करें',
    'auth.selectRole': 'अपनी भूमिका चुनें',
    'auth.farmer': 'किसान',
    'auth.driver': 'ड्राइवर',
    'role.farmer': 'किसान',
    'role.driver': 'ड्राइवर',
    'role.farmerDesc': 'अपने खेत के लिए मशीनरी बुक करें',
    'role.driverDesc': 'मशीनरी सेवाएं प्रदान करें',
    'common.continue': 'जारी रखें',
    'common.back': 'वापस',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.saved': 'सहेजा गया',
    'common.saving': 'सहेज रहा है...',
    'common.loading': 'लोड हो रहा है...',
    'common.yes': 'हां',
    'common.no': 'नहीं',
    'common.ok': 'ठीक है',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.name': 'नाम',
    'common.village': 'गांव',
    'common.district': 'जिला',
    'common.phone': 'फोन नंबर',
    'booking.acreage': 'खेत का आकार',
    'profile.name': 'पूरा नाम',
    'profile.village': 'गांव',
    'profile.district': 'जिला',
    'profile.state': 'राज्य',
    'profile.editProfile': 'प्रोफाइल संपादित करें',
    'profile.selectFarmLocation': 'नक्शे पर अपने खेत का स्थान चुनें',
    'profile.locationSelected': 'स्थान चयनित',
    'driver.uploadPhoto': 'फोटो अपलोड करें',
    'driver.status': 'स्थिति',
    'driver.online': 'ऑनलाइन',
    'driver.offline': 'ऑफलाइन',
    'map.nearbyDrivers': 'आस-पास के ड्राइवर',
    'map.searchLocation': 'स्थान खोजें...',
    'map.viewProfile': 'प्रोफाइल देखें',
    'map.book': 'बुक करें',
  }
};

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Try to get the stored language or default to English
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language');
    return (storedLang === 'en' || storedLang === 'hi') ? storedLang : 'en';
  });

  // Function to translate keys
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Set HTML lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
