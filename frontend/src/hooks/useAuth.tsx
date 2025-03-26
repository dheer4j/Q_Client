import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => { throw new Error('Login not implemented'); },
  register: async () => { throw new Error('Register not implemented'); },
  logout: () => { throw new Error('Logout not implemented'); },
});

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');

        if (token) {
          const storedUserData = localStorage.getItem('userData');

          if (storedUserData) {
            const userData: User = JSON.parse(storedUserData);

            if (userData && userData.id) {
              setUser(userData);
            } else {
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Helper function to clear authentication data
  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful login
      const userData: User = {
        id: '1',
        username: email.split('@')[0],
        email
      };

      // Save auth data to localStorage
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful registration
      const userData: User = {
        id: '1',
        username,
        email
      };

      // Save auth data to localStorage
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    // Remove auth data from localStorage
    clearAuthData();

    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
