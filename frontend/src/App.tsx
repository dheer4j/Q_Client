import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define API endpoints
const API_BASE_URL = 'http://localhost:8080/api';
const WS_URL = 'ws://localhost:8081';

// Define types for our data structures
interface User {
  id: string;
  username: string;
}

interface Email {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  encrypted: boolean;
  timestamp: string;
}

interface KeyPair {
  id: string;
  publicKey: string;
  algorithm: string;
  createdAt: string;
}

const App: React.FC = () => {
  // State variables
  const [serverStatus, setServerStatus] = useState<string>('Checking...');
  const [users, setUsers] = useState<User[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [keyPairs, setKeyPairs] = useState<KeyPair[]>([]);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Form state
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  
  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
    fetchUsers();
  }, []);
  
  // Function to check server status
  const checkServerStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/health`);
      setServerStatus(response.data || 'Server is running');
      setError('');
    } catch (err) {
      setServerStatus('Offline');
      setError('Failed to connect to server');
      console.error('Server status check failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data || []);
      setError('');
    } catch (err) {
      setUsers([]);
      setError('Failed to fetch users');
      console.error('Fetch users failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to generate a new key pair
  const generateKeyPair = async () => {
    try {
      setLoading(true);
      setTestResult('Generating key pair...');
      const response = await axios.post(`${API_BASE_URL}/keys/generate`);
      setKeyPairs(prev => [...prev, response.data]);
      setTestResult(`Key pair generated successfully with ID: ${response.data.id}`);
      setError('');
    } catch (err) {
      setTestResult('Key pair generation failed');
      setError('Failed to generate key pair');
      console.error('Generate key pair failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to send an encrypted email
  const sendEncryptedEmail = async () => {
    if (!emailSubject || !emailBody || !recipient) {
      setError('Please fill in all email fields');
      return;
    }
    
    try {
      setLoading(true);
      setTestResult('Sending encrypted email...');
      const response = await axios.post(`${API_BASE_URL}/emails/send`, {
        subject: emailSubject,
        body: emailBody,
        recipient,
        encrypted: true
      });
      setTestResult('Email sent successfully!');
      setEmailSubject('');
      setEmailBody('');
      setRecipient('');
      setError('');
    } catch (err) {
      setTestResult('Failed to send email');
      setError('Email sending failed');
      console.error('Send email failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch emails
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/emails`);
      setEmails(response.data || []);
      setTestResult(`Retrieved ${response.data.length} emails`);
      setError('');
    } catch (err) {
      setEmails([]);
      setTestResult('Failed to fetch emails');
      setError('Email retrieval failed');
      console.error('Fetch emails failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Styles
  const containerStyle = {
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  };
  
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };
  
  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    marginRight: '10px'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  };
  
  return (
    <div style={containerStyle}>
      <h1 style={{ color: '#4f46e5', marginBottom: '20px', textAlign: 'center' }}>
        Quantum Email Client - Backend Test
      </h1>
      
      {/* Server Status */}
      <div style={cardStyle}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Server Status</h2>
        <p>
          <strong>Status:</strong> 
          <span style={{ 
            color: serverStatus === 'Offline' ? 'red' : 'green',
            fontWeight: 'bold'
          }}>
            {serverStatus}
          </span>
        </p>
        <button 
          style={buttonStyle} 
          onClick={checkServerStatus}
          disabled={loading}
        >
          Refresh Status
        </button>
      </div>
      
      {/* Users */}
      <div style={cardStyle}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Users</h2>
        {users.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {users.map(user => (
              <li key={user.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <strong>ID:</strong> {user.id} | <strong>Username:</strong> {user.username}
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )}
        <button 
          style={buttonStyle} 
          onClick={fetchUsers}
          disabled={loading}
        >
          Refresh Users
        </button>
      </div>
      
      {/* Key Generation Test */}
      <div style={cardStyle}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Quantum Key Generation Test</h2>
        <p>Test the backend's ability to generate quantum-resistant key pairs.</p>
        <button 
          style={buttonStyle} 
          onClick={generateKeyPair}
          disabled={loading}
        >
          Generate New Key Pair
        </button>
        
        {keyPairs.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <h3>Generated Keys:</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {keyPairs.map(key => (
                <li key={key.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>ID:</strong> {key.id} | <strong>Algorithm:</strong> {key.algorithm}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Email Encryption Test */}
      <div style={cardStyle}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Email Encryption Test</h2>
        <p>Test sending an encrypted email through the backend.</p>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Recipient" 
            style={inputStyle}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Subject" 
            style={inputStyle}
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          <textarea 
            placeholder="Email body" 
            style={{ ...inputStyle, height: '100px' }}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
          />
        </div>
        
        <button 
          style={buttonStyle} 
          onClick={sendEncryptedEmail}
          disabled={loading}
        >
          Send Encrypted Email
        </button>
        <button 
          style={{ ...buttonStyle, backgroundColor: '#6b7280' }} 
          onClick={fetchEmails}
          disabled={loading}
        >
          Fetch Emails
        </button>
        
        {emails.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <h3>Emails:</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {emails.map(email => (
                <li key={email.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>Subject:</strong> {email.subject} | 
                  <strong>From:</strong> {email.sender} | 
                  <strong>To:</strong> {email.recipient} | 
                  <strong>Encrypted:</strong> {email.encrypted ? 'Yes' : 'No'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Test Results */}
      {testResult && (
        <div style={cardStyle}>
          <h2 style={{ color: '#333', marginTop: 0 }}>Test Results</h2>
          <p style={{ 
            padding: '10px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '4px',
            border: '1px solid #bae6fd'
          }}>
            {testResult}
          </p>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fef2f2', 
          color: '#b91c1c',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #fecaca'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
        © 2025 Quantum Email Client. All rights reserved.
      </div>
    </div>
  );
};

export default App;
