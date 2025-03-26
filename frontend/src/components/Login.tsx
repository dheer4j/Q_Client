import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      await onLogin(email, password);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#131825'
    }}>
      <div style={{
        width: '400px',
        backgroundColor: '#1e2533',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ 
              color: '#3b82f6', 
              fontSize: '28px', 
              marginRight: '10px' 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </span>
            <h1 style={{ 
              fontSize: '28px', 
              color: 'white',
              margin: 0
            }}>
              Quantum Mail
            </h1>
          </div>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
            Sign in to access your secure email
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#4c1d1d',
            color: '#f87171',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#94a3b8',
                fontSize: '14px'
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a3447',
                border: '1px solid #3b4559',
                borderRadius: '4px',
                color: 'white',
                outline: 'none',
                fontSize: '16px'
              }}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#94a3b8',
                fontSize: '14px'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a3447',
                border: '1px solid #3b4559',
                borderRadius: '4px',
                color: 'white',
                outline: 'none',
                fontSize: '16px'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <p>Don't have an account? <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Sign up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
