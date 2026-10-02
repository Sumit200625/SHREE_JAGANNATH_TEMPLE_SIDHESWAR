import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="text-temple-800 font-semibold font-outfit">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Devotee not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Authenticated, but does not have required role permissions
    // Devotee redirected to profile page, while admins get appropriate redirects
    return <Navigate to={user.role === 'devotee' ? '/profile' : '/'} replace />;
  }

  return children;
}
