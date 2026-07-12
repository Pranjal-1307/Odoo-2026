import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, UserRole } from '../types';
import authService from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.data?.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
        // fetch fresh profile in background
        fetchProfile();
      } else {
        fetchProfile();
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.data?.success) {
        const { user: loggedUser, accessToken, refreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(data);
      if (response.data?.success) {
        const { user: loggedUser, accessToken, refreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
      } else {
        throw new Error(response.data?.message || 'Signup failed');
      }
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        hasRole,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
