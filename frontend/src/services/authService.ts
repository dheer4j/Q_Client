import axios from 'axios';

// Use a constant for the API URL since we're in development mode
const API_URL = 'http://localhost:8080/api';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// For demo/testing purposes
export const demoLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data
  const userData = {
    id: '1',
    username: email.split('@')[0],
    email,
    quantumKeyStatus: 'active'
  };
  
  // Store in localStorage
  localStorage.setItem('authToken', 'demo-token');
  localStorage.setItem('userData', JSON.stringify(userData));
  
  return { user: userData, token: 'demo-token' };
};
