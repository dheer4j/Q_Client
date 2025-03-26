aimport React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#282c34',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Quantum Email</h1>
      <p style={{ fontSize: '1.5rem', maxWidth: '800px', lineHeight: '1.5' }}>
        This is a simplified test component to verify React rendering is working correctly.
      </p>
      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '30px'
      }}>
        <button style={{
          padding: '12px 24px',
          fontSize: '1rem',
          backgroundColor: '#61dafb',
          border: 'none',
          borderRadius: '4px',
          color: '#282c34',
          cursor: 'pointer'
        }}>
          Login
        </button>
        <button style={{
          padding: '12px 24px',
          fontSize: '1rem',
          backgroundColor: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          color: '#282c34',
          cursor: 'pointer'
        }}>
          Register
        </button>
      </div>
    </div>
  );
};

export default SimpleApp;
