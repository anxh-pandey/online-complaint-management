import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const homePathFor = (role) => (role === 'admin' ? '/admin' : '/dashboard');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring the session

  // Restore the session on page refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = ({ token, user }) => {
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  // expectedRole lets the Admin / Student tabs on the login page reject the wrong account type
  const login = async (email, password, expectedRole) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (expectedRole && data.user.role !== expectedRole) {
      throw new Error(
        expectedRole === 'admin'
          ? 'This account is not an admin account. Use the Student login instead.'
          : 'This is an admin account. Please use the Admin login tab.'
      );
    }
    return saveSession(data);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
