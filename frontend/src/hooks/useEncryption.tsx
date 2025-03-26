import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';
import { 
  generateQuantumKeyPair as apiGenerateKeyPair,
  completeKeyExchange as apiCompleteKeyExchange,
  getEncryptionStatus as apiGetEncryptionStatus,
  encryptEmail as apiEncryptEmail,
  decryptEmail as apiDecryptEmail
} from '../services/encryptionService';
import { formatEncryptionStatus, calculateEncryptionStrength } from '../utils/cryptoUtils';
import { createEncryptionStatusMessage } from '../utils/webSocketUtils';

interface EncryptionStatus {
  status: 'active' | 'warning' | 'error' | 'inactive';
  message: string;
  keyExpiresIn?: string;
  keyStrength?: string;
  algorithm?: string;
  keySize?: number;
}

interface EncryptionContextType {
  encryptionStatus: EncryptionStatus | null;
  encryptEmail: (emailData: any) => Promise<{ encryptedContent: string, encryptedSharedSecret: string }>;
  decryptEmail: (emailId: string, encryptedContent: string, encryptedSharedSecret: string) => Promise<string>;
  generateQuantumKeyPair: () => Promise<void>;
  completeKeyExchange: () => Promise<void>;
  rotateKeys: () => Promise<void>;
  encryptionStrength: number;
}

// Create context with default values
export const EncryptionContext = createContext<EncryptionContextType>({
  encryptionStatus: null,
  encryptEmail: async () => ({ encryptedContent: '', encryptedSharedSecret: '' }),
  decryptEmail: async () => '',
  generateQuantumKeyPair: async () => {},
  completeKeyExchange: async () => {},
  rotateKeys: async () => {},
  encryptionStrength: 0
});

interface EncryptionProviderProps {
  children: React.ReactNode;
}

// Provider component
export const EncryptionProvider: React.FC<EncryptionProviderProps> = ({ children }) => {
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus | null>(null);
  const [encryptionStrength, setEncryptionStrength] = useState<number>(0);
  const { user } = useAuth();
  const { sendMessage } = useWebSocket(`ws://localhost:8080/ws${user?.id ? `?user_id=${user.id}` : ''}`);

  // Check encryption status on mount and when user changes
  useEffect(() => {
    const checkEncryptionStatus = async () => {
      try {
        if (!user) {
          setEncryptionStatus({
            status: 'inactive',
            message: 'Please log in to use encryption'
          });
          return;
        }

        const statusData = await apiGetEncryptionStatus();
        setEncryptionStatus(statusData);
        
        // Calculate encryption strength based on algorithm and key size
        if (statusData.algorithm && statusData.keySize) {
          const strength = calculateEncryptionStrength(statusData.algorithm, statusData.keySize);
          setEncryptionStrength(strength);
        }
      } catch (err: any) {
        console.error('Failed to check encryption status:', err);
        setEncryptionStatus({
          status: 'error',
          message: 'Encryption status check failed: ' + (err.message || 'Unknown error')
        });
      }
    };

    checkEncryptionStatus();
    
    // Set up interval to periodically check encryption status
    const intervalId = setInterval(checkEncryptionStatus, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(intervalId);
  }, [user]);

  const encryptEmail = async (emailData: any): Promise<{ encryptedContent: string, encryptedSharedSecret: string }> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!encryptionStatus || encryptionStatus.status !== 'active') {
        throw new Error('Encryption is not active');
      }

      const result = await apiEncryptEmail(emailData);
      
      return {
        encryptedContent: result.encryptedContent,
        encryptedSharedSecret: result.encryptedSharedSecret
      };
    } catch (err: any) {
      console.error('Encryption failed:', err);
      setEncryptionStatus({
        status: 'error',
        message: 'Encryption failed: ' + (err.message || 'Unknown error')
      });
      throw err;
    }
  };

  const decryptEmail = async (emailId: string, encryptedContent: string, encryptedSharedSecret: string): Promise<string> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!encryptionStatus || encryptionStatus.status !== 'active') {
        throw new Error('Encryption is not active');
      }

      const result = await apiDecryptEmail(emailId, encryptedContent, encryptedSharedSecret);
      return result;
    } catch (err: any) {
      console.error('Decryption failed:', err);
      setEncryptionStatus({
        status: 'error',
        message: 'Decryption failed: ' + (err.message || 'Unknown error')
      });
      throw err;
    }
  };

  const generateQuantumKeyPair = async (): Promise<void> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await apiGenerateKeyPair();
      
      // Update encryption status
      setEncryptionStatus({
        status: 'active',
        message: 'New quantum keys generated',
        keyExpiresIn: result.expiresIn,
        keyStrength: result.strength,
        algorithm: result.algorithm,
        keySize: result.keySize
      });
      
      // Calculate and update encryption strength
      if (result.algorithm && result.keySize) {
        const strength = calculateEncryptionStrength(result.algorithm, result.keySize);
        setEncryptionStrength(strength);
      }
      
      // Notify other clients via WebSocket
      if (user.id) {
        sendMessage(createEncryptionStatusMessage(user.id, 'key_generated', {
          keyId: result.keyId,
          expiresIn: result.expiresIn
        }));
      }
    } catch (err: any) {
      console.error('Key generation failed:', err);
      setEncryptionStatus({
        status: 'error',
        message: 'Key generation failed: ' + (err.message || 'Unknown error')
      });
      throw err;
    }
  };

  const completeKeyExchange = async (): Promise<void> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await apiCompleteKeyExchange();
      
      // Update encryption status
      setEncryptionStatus({
        status: 'active',
        message: 'Quantum key exchange complete',
        keyExpiresIn: result.expiresIn,
        keyStrength: result.strength,
        algorithm: result.algorithm,
        keySize: result.keySize
      });
      
      // Calculate and update encryption strength
      if (result.algorithm && result.keySize) {
        const strength = calculateEncryptionStrength(result.algorithm, result.keySize);
        setEncryptionStrength(strength);
      }
      
      // Notify other clients via WebSocket
      if (user.id) {
        sendMessage(createEncryptionStatusMessage(user.id, 'key_exchange_complete', {
          keyId: result.keyId,
          expiresIn: result.expiresIn
        }));
      }
    } catch (err: any) {
      console.error('Key exchange failed:', err);
      setEncryptionStatus({
        status: 'error',
        message: 'Key exchange failed: ' + (err.message || 'Unknown error')
      });
      throw err;
    }
  };
  
  const rotateKeys = async (): Promise<void> => {
    try {
      // First generate new keys
      await generateQuantumKeyPair();
      
      // Then complete the key exchange
      await completeKeyExchange();
      
      // Update encryption status
      setEncryptionStatus(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          message: 'Quantum keys rotated successfully'
        };
      });
      
      // Notify other clients via WebSocket
      if (user?.id) {
        sendMessage(createEncryptionStatusMessage(user.id, 'key_rotated', {
          timestamp: new Date().toISOString()
        }));
      }
    } catch (err: any) {
      console.error('Key rotation failed:', err);
      setEncryptionStatus({
        status: 'error',
        message: 'Key rotation failed: ' + (err.message || 'Unknown error')
      });
      throw err;
    }
  };

  const value = {
    encryptionStatus,
    encryptEmail,
    decryptEmail,
    generateQuantumKeyPair,
    completeKeyExchange,
    rotateKeys,
    encryptionStrength
  };

  return <EncryptionContext.Provider value={value}>{children}</EncryptionContext.Provider>;
};

// Custom hook to use the encryption context
export const useEncryption = (): EncryptionContextType => {
  const context = useContext(EncryptionContext);
  
  if (!context) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  
  return context;
};

export default useEncryption;
