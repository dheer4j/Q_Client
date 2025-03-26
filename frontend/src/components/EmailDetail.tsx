import React from 'react';
import { Email } from './EmailList';

interface EmailDetailProps {
  email: Email | null;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email }) => {
  if (!email) {
    return (
      <div style={{
        flex: '2',
        backgroundColor: '#1e2533',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#94a3b8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Select an email to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: '2',
      backgroundColor: '#1e2533',
      height: '100vh',
      overflowY: 'auto',
      padding: '20px 30px',
      color: 'white'
    }}>
      <h2 style={{ marginBottom: '20px' }}>{email.subject}</h2>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '10px 0',
        borderBottom: '1px solid #2c3344'
      }}>
        <div>
          <div style={{ marginBottom: '5px' }}>
            <strong>From:</strong> {email.sender}
          </div>
          <div>
            <strong>To:</strong> {email.recipient}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {email.encrypted && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: '#2a3447',
              padding: '5px 10px',
              borderRadius: '4px',
              marginRight: '10px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span style={{ color: '#4ade80', fontSize: '14px' }}>Encrypted</span>
            </div>
          )}
          
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>
            {new Date(email.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div style={{ lineHeight: '1.6' }}>
        {email.body.split('\n').map((paragraph, index) => (
          <p key={index} style={{ marginBottom: '15px' }}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

export default EmailDetail;
