import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './lib/i18n';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast/ToastContainer';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import HomeNew from './pages/HomeNew';
import Catalogue from './pages/Catalogue';
import Chapter from './pages/Chapter';
import Library from './pages/Library';
import Profile from './pages/Profile';
import ActiveTimers from './pages/ActiveTimers';
import Account from './pages/Account';
import LayoutNew from './components/common/LayoutNew';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import { initializeTheme } from './stores/themeStore';

function AppContent() {
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LayoutNew>
                <HomeNew />
              </LayoutNew>
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalogue"
          element={
            <ProtectedRoute>
              <LayoutNew>
                <Catalogue />
              </LayoutNew>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapters/:id"
          element={
            <ProtectedRoute>
              <LayoutNew>
                <Chapter />
              </LayoutNew>
            </ProtectedRoute>
          }
        />
        {/* Legacy reader route - redirect to catalogue */}
        <Route
          path="/reader/:volumeId"
          element={<Navigate to="/catalogue" replace />}
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LayoutNew>
                <Library />
              </LayoutNew>
            </ProtectedRoute>
          }
        />
        <Route
          path="/timers"
          element={
            <ProtectedRoute>
              <LayoutNew>
                <ActiveTimers />
              </LayoutNew>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <LayoutNew>
                <Profile />
              </LayoutNew>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/:section?"
          element={
            <ProtectedRoute>
              <LayoutNew>
                <Account />
              </LayoutNew>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </I18nProvider>
  );
}

export default App;
