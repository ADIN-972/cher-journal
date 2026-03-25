import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, loadUser } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // If we have a persisted user but need to validate session
    const initAuth = async () => {
      if (user && !isInitialized) {
        // Validate session with backend
        await loadUser();
      }
      setIsInitialized(true);
    };

    initAuth();
  }, [user, loadUser, isInitialized]);

  // Show loading state while checking authentication
  if (isLoading || (!isInitialized && user)) {
    return (
      <div className="min-h-screen bg-boudoir-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-charcoal dark:text-white/70 font-light">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to email verification if not verified
  if (user && user.emailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  // Render protected content
  return <>{children}</>;
}
