import axios from 'axios';

// Use a constant for the API URL since we're in development mode
const API_URL = 'http://localhost:8080/api';

// Generate a new quantum-resistant key pair
export const generateQuantumKeyPair = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/encryption/generate-key-pair`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to generate key pair');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Complete the key exchange process with the server
export const completeKeyExchange = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/encryption/complete-key-exchange`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to complete key exchange');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Get the current encryption status
export const getEncryptionStatus = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `${API_URL}/encryption/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get encryption status');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Encrypt email content
export const encryptEmail = async (emailData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/encryption/encrypt`,
      emailData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to encrypt email');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Decrypt email content
export const decryptEmail = async (emailId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/encryption/decrypt`,
      { emailId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.content;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to decrypt email');
    }
    throw new Error('Network error. Please try again.');
  }
};

// For demo/testing purposes
export const mockEncryptionStatus = () => {
  return {
    status: 'active',
    message: 'Quantum encryption active',
    keyExpiresIn: '29 days',
    keyStrength: 'high'
  };
};
