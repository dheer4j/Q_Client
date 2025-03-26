/**
 * Utility functions for handling cryptographic operations in the frontend
 * These functions interface with the backend's quantum encryption services
 */

// Convert ArrayBuffer to Base64 string
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Convert Base64 string to ArrayBuffer
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Format encryption status for display
export const formatEncryptionStatus = (status: {
  status: string;
  message: string;
  keyExpiresIn: string;
  keyStrength: string;
}) => {
  return {
    isActive: status.status === 'active',
    message: status.message,
    expiresIn: status.keyExpiresIn,
    strength: status.keyStrength,
    color: getStatusColor(status.status),
  };
};

// Get color based on encryption status
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'green';
    case 'warning':
      return 'yellow';
    case 'expired':
    case 'inactive':
      return 'red';
    default:
      return 'gray';
  }
};

// Format key expiration time
export const formatKeyExpiration = (expiresInDays: number): string => {
  if (expiresInDays <= 0) {
    return 'Expired';
  } else if (expiresInDays === 1) {
    return 'Expires in 1 day';
  } else if (expiresInDays < 7) {
    return `Expires in ${expiresInDays} days`;
  } else if (expiresInDays < 30) {
    const weeks = Math.floor(expiresInDays / 7);
    return `Expires in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  } else {
    const months = Math.floor(expiresInDays / 30);
    return `Expires in ${months} ${months === 1 ? 'month' : 'months'}`;
  }
};

// Calculate encryption strength percentage based on algorithm and key size
export const calculateEncryptionStrength = (algorithm: string, keySize: number): number => {
  // This is a simplified representation for UI purposes
  // In reality, encryption strength depends on many factors
  switch (algorithm.toLowerCase()) {
    case 'kyber':
      return keySize >= 1024 ? 95 : 85;
    case 'ntru':
      return keySize >= 1024 ? 90 : 80;
    case 'sike':
      return keySize >= 1024 ? 85 : 75;
    case 'dilithium':
      return keySize >= 1024 ? 92 : 82;
    default:
      return 50; // Unknown algorithm
  }
};

// Check if an email is encrypted
export const isEmailEncrypted = (email: any): boolean => {
  return !!email.isEncrypted;
};

// Generate a random key for testing purposes
export const generateRandomTestKey = (): string => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return arrayBufferToBase64(array.buffer);
};
