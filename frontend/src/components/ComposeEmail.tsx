import React, { useState } from 'react';

interface ComposeEmailProps {
  onClose: () => void;
  onSend: (recipient: string, subject: string, body: string, encrypted: boolean) => Promise<void>;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({ onClose, onSend }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [encrypted, setEncrypted] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!recipient) {
      setError('Recipient is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!subject) {
      setError('Subject is required');
      return;
    }

    if (!body) {
      setError('Email body is required');
      return;
    }

    try {
      setSending(true);
      await onSend(recipient, subject, body, encrypted);
      onClose();
    } catch (err) {
      setError('Failed to send email. Please try again.');
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e2533',
        borderRadius: '8px',
        width: '600px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #2c3344',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Compose Email</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {error && (
            <div style={{
              backgroundColor: '#4c1d1d',
              color: '#f87171',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="To"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#2a3447',
                border: '1px solid #3b4559',
                borderRadius: '4px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#2a3447',
                border: '1px solid #3b4559',
                borderRadius: '4px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <textarea
              placeholder="Write your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#2a3447',
                border: '1px solid #3b4559',
                borderRadius: '4px',
                color: 'white',
                outline: 'none',
                minHeight: '200px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <input
              type="checkbox"
              id="encrypt"
              checked={encrypted}
              onChange={(e) => setEncrypted(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            <label htmlFor="encrypt" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Use quantum encryption
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #3b4559',
                borderRadius: '4px',
                color: '#94a3b8',
                marginRight: '10px',
                cursor: 'pointer'
              }}
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                opacity: sending ? 0.7 : 1
              }}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
