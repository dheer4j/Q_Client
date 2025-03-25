// @ts-ignore
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuantumKeyPair, completeKeyExchange } from '../../services/encryptionService';

const QuantumKeyExchange: React.FC = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 1) {
      startKeyGeneration();
    }
  }, [step]);

  // Simulate key generation progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isLoading && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, progress]);

  // When progress reaches 100%, move to next step
  useEffect(() => {
    if (progress === 100 && step === 1) {
      setTimeout(() => {
        setStep(2);
        setIsLoading(false);
      }, 500);
    } else if (progress === 100 && step === 2) {
      setTimeout(() => {
        setStep(3);
        setIsLoading(false);
      }, 500);
    }
  }, [progress, step]);

  const startKeyGeneration = async () => {
    setIsLoading(true);
    setProgress(0);
    setError('');
    
    try {
      await generateQuantumKeyPair();
      // Progress will automatically reach 100% via the useEffect
    } catch (err: any) {
      setError(err.message || 'Failed to generate quantum key pair');
      setIsLoading(false);
    }
  };

  const completeExchange = async () => {
    setIsLoading(true);
    setProgress(0);
    setError('');
    
    try {
      await completeKeyExchange();
      // Progress will automatically reach 100% via the useEffect
    } catch (err: any) {
      setError(err.message || 'Failed to complete key exchange');
      setIsLoading(false);
    }
  };

  const finishSetup = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Quantum Key Exchange
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Setting up your quantum-secure encryption
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900 text-white p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          {/* Step 1: Generate Key Pair */}
          <div className={`transition-opacity duration-300 ${step !== 1 ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-white">1. Generating Key Pair</h3>
              {step > 1 && (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: step === 1 ? `${progress}%` : '100%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">
              Generating a post-quantum cryptographic key pair using lattice-based cryptography.
            </p>
          </div>
          
          {/* Step 2: Server Key Exchange */}
          <div className={`transition-opacity duration-300 ${step !== 2 ? (step < 2 ? 'opacity-50' : 'opacity-50') : 'opacity-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-white">2. Secure Key Exchange</h3>
              {step > 2 && (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: step === 2 ? `${progress}%` : (step > 2 ? '100%' : '0%') }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">
              Exchanging keys with the server using quantum-resistant protocols.
            </p>
            {step === 2 && !isLoading && progress < 100 && (
              <button
                onClick={completeExchange}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start Key Exchange
              </button>
            )}
          </div>
          
          {/* Step 3: Complete */}
          <div className={`transition-opacity duration-300 ${step !== 3 ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-white">3. Setup Complete</h3>
              {step > 3 && (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-400">
              Your quantum-secure encryption is now set up and ready to use.
            </p>
            {step === 3 && (
              <button
                onClick={finishSetup}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Continue to Email Client
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500">
            Using post-quantum cryptography to protect against future quantum computing threats
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumKeyExchange;
