
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import BookingsPage from "./pages/BookingsPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import MorePage from "./pages/MorePage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import CompleteFarmerProfilePage from "./pages/CompleteFarmerProfilePage";
import CompleteDriverProfilePage from "./pages/CompleteDriverProfilePage";
import DriverProfilePage from "./pages/DriverProfilePage";
import CreateBookingPage from "./pages/CreateBookingPage";
import DriverServicesPage from "./pages/DriverServicesPage";
import DriverEarningsPage from "./pages/DriverEarningsPage";
import NotFound from "./pages/NotFound";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import HelpPage from "./pages/HelpPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import AboutPage from "./pages/AboutPage";
import SettingsPage from "./pages/SettingsPage";
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/index" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/select-role" element={<RoleSelectionPage />} />
              <Route path="/complete-farmer-profile" element={<CompleteFarmerProfilePage />} />
              <Route path="/complete-driver-profile" element={<CompleteDriverProfilePage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="/driver/profile/:driverId" element={<DriverProfilePage />} />
              <Route path="/booking/new/:driverId" element={<CreateBookingPage />} />
              <Route path="/driver-services" element={<DriverServicesPage />} />
              <Route path="/driver-earnings" element={<DriverEarningsPage />} />
              <Route path="/admin/*" element={<AdminDashboardPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
