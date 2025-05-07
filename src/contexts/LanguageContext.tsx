
import React, { createContext, useContext, useState, useEffect } from 'react';

// Available languages
type Language = 'en' | 'hi' | 'mr';

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
    'auth.logout': 'Logout',
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
    'profile.language': 'Language',
    'profile.settings': 'Settings',
    'profile.help': 'Help',
    'profile.about': 'About',
    'profile.myProfile': 'My Profile',
    'driver.uploadPhoto': 'Upload Photo',
    'driver.status': 'Status',
    'driver.online': 'Online',
    'driver.offline': 'Offline',
    'map.nearbyDrivers': 'Nearby Drivers',
    'map.searchLocation': 'Search location...',
    'map.viewProfile': 'View Profile',
    'map.book': 'Book',
    'bottomNav.home': 'Home',
    'bottomNav.map': 'Map',
    'bottomNav.bookings': 'Bookings',
    'bottomNav.profile': 'Profile',
    'bottomNav.more': 'More',
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
    'auth.logout': 'लॉगआउट',
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
    'profile.language': 'भाषा',
    'profile.settings': 'सेटिंग्स',
    'profile.help': 'मदद',
    'profile.about': 'के बारे में',
    'profile.myProfile': 'मेरी प्रोफ़ाइल',
    'driver.uploadPhoto': 'फोटो अपलोड करें',
    'driver.status': 'स्थिति',
    'driver.online': 'ऑनलाइन',
    'driver.offline': 'ऑफलाइन',
    'map.nearbyDrivers': 'आस-पास के ड्राइवर',
    'map.searchLocation': 'स्थान खोजें...',
    'map.viewProfile': 'प्रोफाइल देखें',
    'map.book': 'बुक करें',
    'bottomNav.home': 'होम',
    'bottomNav.map': 'मैप',
    'bottomNav.bookings': 'बुकिंग',
    'bottomNav.profile': 'प्रोफाइल',
    'bottomNav.more': 'अधिक',
  },
  mr: {
    'app.name': 'कृषी कनेक्ट',
    'auth.signIn': 'साइन इन करा',
    'auth.signUp': 'साइन अप करा',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.forgotPassword': 'पासवर्ड विसरलात?',
    'auth.noAccount': "खाते नाही?",
    'auth.hasAccount': 'आधीपासूनच खाते आहे?',
    'auth.completeProfile': 'आपली प्रोफाईल पूर्ण करा',
    'auth.selectRole': 'आपली भूमिका निवडा',
    'auth.farmer': 'शेतकरी',
    'auth.driver': 'ड्रायव्हर',
    'auth.logout': 'लॉगआउट',
    'role.farmer': 'शेतकरी',
    'role.driver': 'ड्रायव्हर',
    'role.farmerDesc': 'आपल्या शेतासाठी मशिनरी बुक करा',
    'role.driverDesc': 'मशिनरी सेवा प्रदान करा',
    'common.continue': 'पुढे जा',
    'common.back': 'मागे',
    'common.cancel': 'रद्द करा',
    'common.save': 'जतन करा',
    'common.saved': 'जतन केले',
    'common.saving': 'जतन करत आहे...',
    'common.loading': 'लोड करत आहे...',
    'common.yes': 'होय',
    'common.no': 'नाही',
    'common.ok': 'ठीक आहे',
    'common.edit': 'संपादित करा',
    'common.delete': 'हटवा',
    'common.name': 'नाव',
    'common.village': 'गाव',
    'common.district': 'जिल्हा',
    'common.phone': 'फोन नंबर',
    'booking.acreage': 'शेताचा आकार',
    'profile.name': 'पूर्ण नाव',
    'profile.village': 'गाव',
    'profile.district': 'जिल्हा',
    'profile.state': 'राज्य',
    'profile.editProfile': 'प्रोफाईल संपादित करा',
    'profile.selectFarmLocation': 'नकाशावर आपल्या शेताचे स्थान निवडा',
    'profile.locationSelected': 'स्थान निवडले',
    'profile.language': 'भाषा',
    'profile.settings': 'सेटिंग्ज',
    'profile.help': 'मदत',
    'profile.about': 'बद्दल',
    'profile.myProfile': 'माझी प्रोफाईल',
    'driver.uploadPhoto': 'फोटो अपलोड करा',
    'driver.status': 'स्थिती',
    'driver.online': 'ऑनलाईन',
    'driver.offline': 'ऑफलाईन',
    'map.nearbyDrivers': 'जवळपासचे ड्रायव्हर',
    'map.searchLocation': 'स्थान शोधा...',
    'map.viewProfile': 'प्रोफाईल पहा',
    'map.book': 'बुक करा',
    'bottomNav.home': 'होम',
    'bottomNav.map': 'नकाशा',
    'bottomNav.bookings': 'बुकिंग',
    'bottomNav.profile': 'प्रोफाईल',
    'bottomNav.more': 'अधिक',
  }
};

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Try to get the stored language or default to English
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language');
    return (storedLang === 'en' || storedLang === 'hi' || storedLang === 'mr') ? storedLang as Language : 'en';
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
