import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth, homePathFor } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { isValidEmail } from '../utils/helpers';
import AuthShell from '../components/AuthShell';
import { Spinner } from '../components/Spinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // "user" (student) or "admin" tab
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!isValidEmail(values.email.trim())) e.email = 'Enter a valid email address';
    if (!values.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(values.email.trim(), values.password, role);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(homePathFor(user.role), { replace: true });
    } catch (err) {
      toast.error(err.response ? getErrorMessage(err) : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const tabClass = (active) =>
    `flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
      active ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <AuthShell
      title={role === 'admin' ? 'Admin login' : 'Welcome back'}
      subtitle={role === 'admin' ? 'Sign in to manage and resolve complaints.' : 'Sign in to submit and track your complaints.'}
    >
      <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
        <button type="button" className={tabClass(role === 'user')} onClick={() => setRole('user')}>
          Student
        </button>
        <button type="button" className={tabClass(role === 'admin')} onClick={() => setRole('admin')}>
          Admin
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`input ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`input ${errors.password ? 'input-error' : ''}`}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {role === 'user' && (
        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
