
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '../types';

// English translations
const en = {
  common: {
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    submit: "Submit",
  },
  auth: {
    phoneLogin: "Login with Phone",
    enterPhone: "Enter your phone number",
    phoneNumber: "Phone Number",
    sendOtp: "Send OTP",
    enterOtp: "Enter the OTP sent to your phone",
    verifyOtp: "Verify OTP",
    resendOtp: "Resend OTP",
    logout: "Logout",
    selectRole: "Select Your Role",
    farmer: "Farmer",
    driver: "Tractor Driver",
    completeProfile: "Complete Your Profile",
  },
  home: {
    welcome: "Welcome",
    nearbyDrivers: "Nearby Tractor Drivers",
    bookNow: "Book Now",
    recentBookings: "Recent Bookings",
    viewAll: "View All",
    announcements: "Announcements",
  },
  booking: {
    bookingTitle: "Book a Tractor",
    selectService: "Select Service",
    selectDriver: "Select Driver",
    selectDateTime: "Select Date & Time",
    farmLocation: "Farm Location",
    acreage: "Acreage",
    totalPrice: "Total Price",
    confirmBooking: "Confirm Booking",
    paymentMethod: "Payment Method",
    payNow: "Pay Now",
    payLater: "Pay Later",
    cashOnDelivery: "Cash on Delivery",
    requestSent: "Request Sent Successfully",
    waitingForConfirmation: "Waiting for driver confirmation",
  },
  map: {
    searchLocation: "Search Location",
    currentLocation: "Current Location",
    nearbyDrivers: "Nearby Drivers",
    viewProfile: "View Profile",
    book: "Book",
  },
  profile: {
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    name: "Name",
    phone: "Phone",
    village: "Village",
    district: "District",
    state: "State",
    language: "Language",
    settings: "Settings",
    help: "Help & Support",
    about: "About KrushiLink",
  },
  driver: {
    myServices: "My Services",
    addEquipment: "Add Equipment",
    editEquipment: "Edit Equipment",
    equipmentName: "Equipment Name",
    pricePerAcre: "Price per Acre (₹)",
    pricePerHour: "Price per Hour (₹)",
    tractorDetails: "Tractor Details",
    tractorType: "Tractor Type",
    tractorPhoto: "Tractor Photo",
    drivingLicense: "Driving License",
    uploadPhoto: "Upload Photo",
    goOnline: "Go Online",
    goOffline: "Go Offline",
    earnings: "My Earnings",
    pendingPayments: "Pending Payments",
  },
  bookings: {
    myBookings: "My Bookings",
    upcoming: "Upcoming",
    completed: "Completed",
    pending: "Pending",
    bookingDetails: "Booking Details",
    service: "Service",
    location: "Location",
    date: "Date",
    time: "Time",
    status: "Status",
    price: "Price",
    paymentStatus: "Payment Status",
    markComplete: "Mark as Complete",
    cancelBooking: "Cancel Booking",
    rateService: "Rate Service",
    awaitingPayment: "Awaiting Payment",
    sendReminder: "Send Payment Reminder",
  },
  bottomNav: {
    home: "Home",
    map: "Map",
    bookings: "Bookings",
    profile: "Profile",
    more: "More"
  },
};

// Hindi translations
const hi = {
  common: {
    loading: "लोड हो रहा है...",
    error: "एक त्रुटि हुई",
    retry: "पुन: प्रयास करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    back: "वापस",
    next: "आगे",
    submit: "जमा करें",
  },
  auth: {
    phoneLogin: "फोन से लॉगिन करें",
    enterPhone: "अपना फोन नंबर दर्ज करें",
    phoneNumber: "फोन नंबर",
    sendOtp: "OTP भेजें",
    enterOtp: "आपके फोन पर भेजा गया OTP दर्ज करें",
    verifyOtp: "OTP सत्यापित करें",
    resendOtp: "OTP पुनः भेजें",
    logout: "लॉगआउट",
    selectRole: "अपनी भूमिका चुनें",
    farmer: "किसान",
    driver: "ट्रैक्टर चालक",
    completeProfile: "अपनी प्रोफ़ाइल पूरी करें",
  },
  home: {
    welcome: "स्वागत है",
    nearbyDrivers: "आस-पास के ट्रैक्टर चालक",
    bookNow: "अभी बुक करें",
    recentBookings: "हाल की बुकिंग",
    viewAll: "सभी देखें",
    announcements: "घोषणाएँ",
  },
  booking: {
    bookingTitle: "ट्रैक्टर बुक करें",
    selectService: "सेवा चुनें",
    selectDriver: "चालक चुनें",
    selectDateTime: "दिनांक और समय चुनें",
    farmLocation: "खेत का स्थान",
    acreage: "एकड़ में क्षेत्रफल",
    totalPrice: "कुल कीमत",
    confirmBooking: "बुकिंग की पुष्टि करें",
    paymentMethod: "भुगतान विधि",
    payNow: "अभी भुगतान करें",
    payLater: "बाद में भुगतान करें",
    cashOnDelivery: "डिलीवरी पर नकद",
    requestSent: "अनुरोध सफलतापूर्वक भेजा गया",
    waitingForConfirmation: "चालक की पुष्टि का इंतज़ार है",
  },
  map: {
    searchLocation: "स्थान खोजें",
    currentLocation: "वर्तमान स्थान",
    nearbyDrivers: "आस-पास के चालक",
    viewProfile: "प्रोफ़ाइल देखें",
    book: "बुक करें",
  },
  profile: {
    myProfile: "मेरी प्रोफ़ाइल",
    editProfile: "प्रोफ़ाइल संपादित करें",
    name: "नाम",
    phone: "फोन",
    village: "गाँव",
    district: "जिला",
    state: "राज्य",
    language: "भाषा",
    settings: "सेटिंग्स",
    help: "सहायता और समर्थन",
    about: "क्रुशीलिंक के बारे में",
  },
  driver: {
    myServices: "मेरी सेवाएं",
    addEquipment: "उपकरण जोड़ें",
    editEquipment: "उपकरण संपादित करें",
    equipmentName: "उपकरण का नाम",
    pricePerAcre: "प्रति एकड़ मूल्य (₹)",
    pricePerHour: "प्रति घंटा मूल्य (₹)",
    tractorDetails: "ट्रैक्टर का विवरण",
    tractorType: "ट्रैक्टर का प्रकार",
    tractorPhoto: "ट्रैक्टर की तस्वीर",
    drivingLicense: "ड्राइविंग लाइसेंस",
    uploadPhoto: "तस्वीर अपलोड करें",
    goOnline: "ऑनलाइन जाएँ",
    goOffline: "ऑफलाइन जाएँ",
    earnings: "मेरी कमाई",
    pendingPayments: "लंबित भुगतान",
  },
  bookings: {
    myBookings: "मेरी बुकिंग",
    upcoming: "आगामी",
    completed: "पूर्ण",
    pending: "लंबित",
    bookingDetails: "बुकिंग विवरण",
    service: "सेवा",
    location: "स्थान",
    date: "दिनांक",
    time: "समय",
    status: "स्थिति",
    price: "कीमत",
    paymentStatus: "भुगतान स्थिति",
    markComplete: "पूर्ण के रूप में चिह्नित करें",
    cancelBooking: "बुकिंग रद्द करें",
    rateService: "सेवा का मूल्यांकन करें",
    awaitingPayment: "भुगतान की प्रतीक्षा",
    sendReminder: "भुगतान अनुस्मारक भेजें",
  },
  bottomNav: {
    home: "होम",
    map: "मैप",
    bookings: "बुकिंग",
    profile: "प्रोफाइल",
    more: "अधिक"
  },
};

// Marathi translations
const mr = {
  common: {
    loading: "लोड करत आहे...",
    error: "त्रुटी आली",
    retry: "पुन्हा प्रयत्न करा",
    save: "जतन करा",
    cancel: "रद्द करा",
    confirm: "पुष्टी करा",
    back: "मागे",
    next: "पुढे",
    submit: "सबमिट करा",
  },
  auth: {
    phoneLogin: "फोन वरून लॉगिन करा",
    enterPhone: "तुमचा फोन नंबर टाका",
    phoneNumber: "फोन नंबर",
    sendOtp: "OTP पाठवा",
    enterOtp: "तुमच्या फोनवर पाठवलेला OTP टाका",
    verifyOtp: "OTP तपासा",
    resendOtp: "OTP पुन्हा पाठवा",
    logout: "लॉग आउट",
    selectRole: "तुमची भूमिका निवडा",
    farmer: "शेतकरी",
    driver: "ट्रॅक्टर चालक",
    completeProfile: "तुमचा प्रोफाइल पूर्ण करा",
  },
  home: {
    welcome: "स्वागत आहे",
    nearbyDrivers: "जवळील ट्रॅक्टर चालक",
    bookNow: "आता बुक करा",
    recentBookings: "अलीकडील बुकिंग्ज",
    viewAll: "सर्व पहा",
    announcements: "घोषणा",
  },
  booking: {
    bookingTitle: "ट्रॅक्टर बुक करा",
    selectService: "सेवा निवडा",
    selectDriver: "चालक निवडा",
    selectDateTime: "तारीख आणि वेळ निवडा",
    farmLocation: "शेताचे स्थान",
    acreage: "एकरमध्ये क्षेत्रफळ",
    totalPrice: "एकूण किंमत",
    confirmBooking: "बुकिंगची पुष्टी करा",
    paymentMethod: "पेमेंट पद्धत",
    payNow: "आता पैसे द्या",
    payLater: "नंतर पैसे द्या",
    cashOnDelivery: "डिलीवरी वर रोख",
    requestSent: "विनंती यशस्वीरित्या पाठवली",
    waitingForConfirmation: "चालकाच्या पुष्टीची वाट पाहत आहे",
  },
  map: {
    searchLocation: "स्थान शोधा",
    currentLocation: "वर्तमान स्थान",
    nearbyDrivers: "जवळील चालक",
    viewProfile: "प्रोफाइल पहा",
    book: "बुक करा",
  },
  profile: {
    myProfile: "माझा प्रोफाइल",
    editProfile: "प्रोफाइल संपादित करा",
    name: "नाव",
    phone: "फोन",
    village: "गाव",
    district: "जिल्हा",
    state: "राज्य",
    language: "भाषा",
    settings: "सेटिंग्ज",
    help: "मदत आणि सहाय्य",
    about: "क्रुशिलिंक बद्दल",
  },
  driver: {
    myServices: "माझ्या सेवा",
    addEquipment: "उपकरण जोडा",
    editEquipment: "उपकरण संपादित करा",
    equipmentName: "उपकरणाचे नाव",
    pricePerAcre: "प्रति एकर किंमत (₹)",
    pricePerHour: "प्रति तास किंमत (₹)",
    tractorDetails: "ट्रॅक्टरचा तपशील",
    tractorType: "ट्रॅक्टरचा प्रकार",
    tractorPhoto: "ट्रॅक्टरचा फोटो",
    drivingLicense: "ड्रायव्हिंग लायसन्स",
    uploadPhoto: "फोटो अपलोड करा",
    goOnline: "ऑनलाइन जा",
    goOffline: "ऑफलाइन जा",
    earnings: "माझी कमाई",
    pendingPayments: "प्रलंबित पेमेंट्स",
  },
  bookings: {
    myBookings: "माझी बुकिंग्ज",
    upcoming: "आगामी",
    completed: "पूर्ण झालेली",
    pending: "प्रलंबित",
    bookingDetails: "बुकिंग तपशील",
    service: "सेवा",
    location: "स्थान",
    date: "तारीख",
    time: "वेळ",
    status: "स्थिती",
    price: "किंमत",
    paymentStatus: "पेमेंट स्थिती",
    markComplete: "पूर्ण म्हणून चिन्हांकित करा",
    cancelBooking: "बुकिंग रद्द करा",
    rateService: "सेवेचे मूल्यांकन करा",
    awaitingPayment: "पेमेंटची प्रतीक्षा",
    sendReminder: "पेमेंट रिमाइंडर पाठवा",
  },
  bottomNav: {
    home: "होम",
    map: "नकाशा",
    bookings: "बुकिंग्ज",
    profile: "प्रोफाइल",
    more: "अधिक"
  },
};

// Create the translations object
const translations = { en, hi, mr };

// Create the language context
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, category?: string) => string;
}

// Create the language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider props type
interface LanguageProviderProps {
  children: ReactNode;
}

// Language provider component
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('krushilink-language') as Language;
    if (savedLanguage && ['en', 'hi', 'mr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('krushilink-language', language);
  }, [language]);

  // Translation function
  const t = (key: string, category: string = 'common'): string => {
    try {
      const keys = key.split('.');
      const cat = keys.length > 1 ? keys[0] : category;
      const k = keys.length > 1 ? keys[1] : keys[0];
      
      // @ts-ignore - We know these properties exist
      return translations[language][cat][k] || key;
    } catch (error) {
      console.error(`Translation missing for key: ${key} in ${language}`);
      return key;
    }
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
