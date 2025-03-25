import React from 'react';
import { useEncryption } from '../../hooks/useEncryption';

const EncryptionStatus: React.FC = () => {
  const { encryptionStatus } = useEncryption();
  
  // Different states: 'active', 'warning', 'error'
  const status = encryptionStatus?.status || 'active';
  const message = encryptionStatus?.message || 'Quantum encryption active';
  
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-900 text-green-300';
      case 'warning':
        return 'bg-yellow-900 text-yellow-300';
      case 'error':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-green-900 text-green-300';
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center p-2 rounded-md ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default EncryptionStatus;
