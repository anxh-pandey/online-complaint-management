import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, homePathFor } from '../context/AuthContext';
import { FullPageLoader } from './Spinner';

// Only logged-in users with the right role can see the nested routes
export function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homePathFor(user.role)} replace />;

  return <Outlet />;
}

// Login / register pages: logged-in users are sent to their dashboard instead
export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  return <Outlet />;
}
