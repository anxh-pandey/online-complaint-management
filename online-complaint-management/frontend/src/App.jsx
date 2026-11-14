import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, homePathFor } from './context/AuthContext';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { FullPageLoader } from './components/Spinner';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import UserDashboard from './pages/user/UserDashboard';
import MyComplaints from './pages/user/MyComplaints';
import NewComplaint from './pages/user/NewComplaint';
import ComplaintDetails from './pages/user/ComplaintDetails';
import EditComplaint from './pages/user/EditComplaint';
import Profile from './pages/user/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails';

// "/" sends people to the right place
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute role="user" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/complaints" element={<MyComplaints />} />
              <Route path="/complaints/new" element={<NewComplaint />} />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
              <Route path="/complaints/:id/edit" element={<EditComplaint />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
              <Route path="/admin/complaints/:id" element={<AdminComplaintDetails />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
