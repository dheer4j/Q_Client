import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      border: '2px solid #333',
      borderRadius: '8px',
      margin: '20px',
      color: '#333',
      textAlign: 'center'
    }}>
      <h1 style={{ color: 'blue' }}>Test Component</h1>
      <p style={{ fontSize: '18px' }}>If you can see this, basic React rendering is working!</p>
      <p style={{ fontSize: '16px', fontStyle: 'italic' }}>The issue might be with your routes or authentication components.</p>
      <button style={{
        padding: '10px 20px',
        backgroundColor: 'green',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '20px'
      }}>
        Test Button
      </button>
    </div>
  );
};

export default TestComponent;
