import { Link } from 'react-router-dom';
import { useAuth, homePathFor } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-5xl font-bold text-blue-600">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist.</p>
      <Link to={user ? homePathFor(user.role) : '/login'} className="btn-primary mt-6">
        {user ? 'Back to dashboard' : 'Go to login'}
      </Link>
    </div>
  );
}
