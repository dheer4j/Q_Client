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
  login: async () => {},
  register: async () => {},
  logout: () => {},
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
        // In a real app, this would make an API call to verify the token
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Simulate API call to get user data
          // In a real app, this would validate the token with the server
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          
          if (userData && userData.id) {
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would make an API call to authenticate
      // For demo purposes, we'll simulate a successful login
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      const userData = {
        id: '1',
        username: email.split('@')[0],
        email
      };
      
      // Save auth data to localStorage
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would make an API call to register
      // For demo purposes, we'll simulate a successful registration
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful registration
      const userData = {
        id: '1',
        username,
        email
      };
      
      // Save auth data to localStorage
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Remove auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Clear user state
    setUser(null);
    
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
