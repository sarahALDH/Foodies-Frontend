import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, User } from '@/services/auth';
import { getToken } from '@/services/api';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      console.log('Token check on app start:', token ? 'Token exists' : 'No token found');
      
      if (token) {
        // Token exists, try to get current user
        try {
          console.log('Attempting to get current user with stored token...');
          const currentUser = await getCurrentUser();
          console.log('Current user retrieved:', currentUser);
          setUser(currentUser);
          console.log('User state set, isAuthenticated should now be:', !!currentUser);
        } catch (error: any) {
          // Token might be invalid, but don't clear it immediately
          console.error('Failed to get current user:', error?.message || error);
          // Only clear token if it's a 401 (unauthorized)
          if (error?.response?.status === 401 || error?.statusCode === 401) {
            console.log('Token is invalid (401), clearing...');
            setUser(null);
          } else {
            // For other errors, keep the token but set user to null
            console.log('Error getting user, but keeping token for retry');
            setUser(null);
          }
        }
      } else {
        console.log('No token found, user not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiLogin({ email, password });
      
      console.log('Login response in context:', response);
      
      // Handle different response structures
      if (response.user) {
        setUser(response.user);
        router.replace('/(tabs)');
      } else if (response.token) {
        // If we have a token but no user, try to get the user
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Failed to get user after login:', error);
          throw new Error('Login successful but failed to retrieve user data');
        }
      } else {
        throw new Error('Login failed: No user data or token received');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRegister({ name, email, password });
      
      console.log('Register response in context:', response);
      
      // Handle different response structures
      if (response.user) {
        setUser(response.user);
        router.replace('/(tabs)');
      } else if (response.token) {
        // If we have a token but no user, try to get the user
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Failed to get user after registration:', error);
          // If getting user fails, try to login
          await login(email, password);
        }
      } else {
        // If no user or token in response, try to login
        await login(email, password);
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiLogout();
      setUser(null);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      router.replace('/sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, user might be logged out
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
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

