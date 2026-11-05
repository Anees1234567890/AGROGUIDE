import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import CropLibrary from './pages/CropLibrary';
import CropDetails from './pages/CropDetails';
import WeatherPage from './pages/WeatherPage';
import MarketPricesPage from './pages/MarketPricesPage';
import PestDiseaseGuide from './pages/PestDiseaseGuide';
import AssistantPage from './pages/AssistantPage';
import ProfessionalsPage from './pages/ProfessionalsPage';


import CommunityPage from './pages/CommunityPage';
import MyFarmPage from './pages/MyFarmPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import ExpertPortal from './pages/ExpertPortal';
import AboutPage from './pages/AboutPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useAuth } from './context/AuthContext';

// Protected Route Wrapper (Requires Login)
const ProtectedRoute = ({ children, adminOnly = false, expertOnly = false }) => {
  const { isAuthenticated, isAdmin, isProfessional, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Authenticating..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (expertOnly && !isProfessional) return <Navigate to="/dashboard" replace />;

  return children;
};

// Auth Entry Route Wrapper (Unauthenticated users see Login/Register; authenticated users go to /dashboard)
const AuthEntryRoute = ({ TargetComponent = Login }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Checking session..." />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <TargetComponent />;
};

function App() {
  return (
    <Routes>
      {/* Public Pages under MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<AuthEntryRoute TargetComponent={Login} />} />
        <Route path="/register" element={<AuthEntryRoute TargetComponent={Register} />} />
        <Route path="/auth" element={<AuthEntryRoute TargetComponent={AuthPage} />} />
      </Route>

      {/* Protected Features under DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recommendations" element={<CropRecommendation />} />
        <Route path="/crops" element={<CropLibrary />} />
        <Route path="/crops/:id" element={<CropDetails />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/market-prices" element={<MarketPricesPage />} />
        <Route path="/pests" element={<PestDiseaseGuide />} />
        <Route path="/assistant" element={<AssistantPage />} />

        <Route path="/professionals" element={<ProfessionalsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<MyFarmPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/expert-portal"
          element={
            <ProtectedRoute expertOnly>
              <ExpertPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
