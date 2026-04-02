import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';
import LoadingSpinner from './components/LoadingSpinner';

// --- Routes Protégées & Publiques (Inchangées) ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized, fetchCurrentUser } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      const timeoutId = setTimeout(() => {
        console.warn('[ProtectedRoute] Auth timeout - forcing initialized');
        // Don't set error here - let store handle
      }, 6000);

      fetchCurrentUser().catch((err) => {
        console.error('ProtectedRoute auth check failed:', err);
        setAuthError('Session check failed. Please login again.');
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }, [isInitialized, fetchCurrentUser]);

  if (isLoading || !isInitialized) return <LoadingSpinner fullScreen />;
  if (authError || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
        <div className="max-w-md w-full text-center py-12">
          <LoadingSpinner size="lg" />
          <h2 className="text-2xl font-bold text-white mt-6 mb-4">Authentication Required</h2>
          <p className="text-dark-400 mb-8">{authError || 'Please log in to access dashboard.'}</p>
          <a href="/login" className="inline-block bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-8 rounded-xl transition-all">
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};


const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  const { fetchCurrentUser, isLoading: isAuthLoading } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-900">
        <LoadingSpinner fullScreen />
        <p className="mt-4 text-dark-400 animate-pulse">
          Loading your game night...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-900 text-dark-50 flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            {/* Route par défaut : HomePage */}
            <Route path="/" element={<HomePage />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/create-event" element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            } />
            
            <Route path="/events/:id" element={<EventDetailPage />} />

            {/* Redirection automatique vers Home si URL inconnue */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
