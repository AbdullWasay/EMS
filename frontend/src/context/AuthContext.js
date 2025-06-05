import { jwtDecode } from 'jwt-decode';
import { createContext, useEffect, useState } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          // Verify token is valid
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Get user profile
            const response = await authService.getProfile();
            setUser(response.data.data);
          }
        } catch (err) {
          console.error('Error verifying token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [token]);

  // Login user
  const login = async (credentials) => {
    try {
      console.log('Frontend login attempt:', credentials);
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      console.log('Login response:', response.data);
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setToken(token);
      setUser(user);
      setLoading(false);

      return { success: true };
    } catch (err) {
      console.error('Frontend login error:', err);
      console.error('Error response:', err.response?.data);
      setLoading(false);
      setError(err.response?.data?.error || 'Login failed');
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setToken(token);
      setUser(user);
      setLoading(false);

      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Registration failed');
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  // Logout user
  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update state
    setToken(null);
    setUser(null);

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
