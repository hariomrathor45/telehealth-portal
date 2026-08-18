import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Wraps routes that require authentication and specific roles
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 * @param {React.ReactNode} children - Optional children
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p className="loading-text">Verifying security session...</p>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role not allowed → redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = getRedirectPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  // Render children or Outlet
  return children ? children : <Outlet />;
};

function getRedirectPath(role) {
  switch (role) {
    case 'PATIENT': return '/patient/dashboard';
    case 'DOCTOR': return '/doctor/dashboard';
    case 'ADMIN': return '/admin/dashboard';
    default: return '/login';
  }
}

export default ProtectedRoute;
