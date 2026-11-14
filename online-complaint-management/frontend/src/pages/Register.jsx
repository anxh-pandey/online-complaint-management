import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth, homePathFor } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { isValidEmail } from '../utils/helpers';
import AuthShell from '../components/AuthShell';
import { Spinner } from '../components/Spinner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (values.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!isValidEmail(values.email.trim())) e.email = 'Enter a valid email address';
    if (values.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (values.confirmPassword !== values.password) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await register(values.name.trim(), values.email.trim(), values.password);
      toast.success('Account created successfully!');
      navigate(homePathFor(user.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '', autoComplete) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={values[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`input ${errors[name] ? 'input-error' : ''}`}
      />
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  return (
    <AuthShell title="Create your account" subtitle="Register as a student to start submitting complaints.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {field('name', 'Full name', 'text', 'Your full name', 'name')}
        {field('email', 'Email', 'email', 'you@example.com', 'email')}
        {field('password', 'Password', 'password', 'At least 6 characters', 'new-password')}
        {field('confirmPassword', 'Confirm password', 'password', 'Repeat your password', 'new-password')}

        <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
