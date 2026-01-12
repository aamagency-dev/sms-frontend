import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginForm, RegisterForm } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          // Fetch user data from API to get the role
          const userData = await apiService.getCurrentUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginForm) => {
    try {
      console.log('Attempting login...');
      const response: AuthResponse = await apiService.login(credentials.email, credentials.password);
      console.log('Login successful, token received');
      
      // Store token
      localStorage.setItem('access_token', response.access_token);
      
      // Get user info
      console.log('Fetching user info...');
      const userInfo = await apiService.getCurrentUser();
      console.log('User info received:', userInfo);
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Clean up on failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      throw error;
    }
  };

  const register = async (userData: RegisterForm) => {
    try {
      await apiService.register(userData);
      
      // Auto login after registration
      await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
