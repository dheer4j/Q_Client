import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import EmailList, { Email } from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import ComposeEmail from './components/ComposeEmail';
import Login from './components/Login';

// Define API endpoints
const API_BASE_URL = 'http://localhost:8080/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface KeyPair {
  id: string;
  publicKey: string;
  algorithm: string;
  createdAt: string;
}

const App: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // UI state
  const [activeSection, setActiveSection] = useState<string>('inbox');
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Data state
  const [inboxEmails, setInboxEmails] = useState<Email[]>([]);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [draftEmails, setDraftEmails] = useState<Email[]>([]);
  const [encryptedEmails, setEncryptedEmails] = useState<Email[]>([]);
  
  // Get displayed emails based on active section
  const getDisplayedEmails = (): Email[] => {
    switch (activeSection) {
      case 'sent':
        return sentEmails;
      case 'drafts':
        return draftEmails;
      case 'encrypted':
        return encryptedEmails;
      case 'inbox':
      default:
        return inboxEmails;
    }
  };
  
  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      // For demo purposes, we'll simulate a successful login
      const mockUser = {
        id: '1',
        username: email.split('@')[0],
        email: email
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentUser(mockUser);
      setIsAuthenticated(true);
      setLoading(false);
      
      // Load emails after login
      loadEmails();
    } catch (err) {
      setError('Login failed');
      setLoading(false);
      throw err;
    }
  };
  
  // Load emails (would be API calls in a real app)
  const loadEmails = async () => {
    try {
      setLoading(true);
      
      // In a real app, these would be separate API calls
      // const inboxResponse = await axios.get(`${API_BASE_URL}/emails/inbox`);
      // const sentResponse = await axios.get(`${API_BASE_URL}/emails/sent`);
      
      // For demo purposes, we'll create mock data
      const mockInboxEmails: Email[] = [
        {
          id: '1',
          sender: 'quantum.researcher@secure.net',
          recipient: currentUser?.email || '',
          subject: 'Quantum Key Exchange Proposal',
          body: 'Hello,\n\nI would like to propose a new quantum key exchange protocol that builds on the existing Kyber implementation. Our research team has made significant progress in optimizing the algorithm for mobile devices.\n\nWould you be interested in collaborating on this project?\n\nBest regards,\nQuantum Research Team',
          encrypted: true,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false
        },
        {
          id: '2',
          sender: 'admin@quantummail.com',
          recipient: currentUser?.email || '',
          subject: 'Welcome to Quantum Mail',
          body: 'Welcome to Quantum Mail!\n\nWe are excited to have you on board. Our platform uses post-quantum cryptography to ensure your communications remain secure even against quantum computer attacks.\n\nIf you have any questions, please don\'t hesitate to contact our support team.\n\nBest regards,\nThe Quantum Mail Team',
          encrypted: true,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: true
        }
      ];
      
      const mockSentEmails: Email[] = [
        {
          id: '3',
          sender: currentUser?.email || '',
          recipient: 'colleague@example.com',
          subject: 'Project Update',
          body: 'Hi there,\n\nJust wanted to give you a quick update on the project. We have implemented the new quantum-resistant algorithms and everything seems to be working well.\n\nLet me know if you have any questions.\n\nRegards,\n' + (currentUser?.username || ''),
          encrypted: true,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          read: true
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInboxEmails(mockInboxEmails);
      setSentEmails(mockSentEmails);
      setEncryptedEmails([...mockInboxEmails, ...mockSentEmails].filter(email => email.encrypted));
      setDraftEmails([]);
      setError('');
    } catch (err) {
      setError('Failed to load emails');
      console.error('Load emails failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sending email
  const handleSendEmail = async (recipient: string, subject: string, body: string, encrypted: boolean) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // const response = await axios.post(`${API_BASE_URL}/emails/send`, {
      //   recipient,
      //   subject,
      //   body,
      //   encrypted
      // });
      
      // For demo purposes, we'll create a mock sent email
      const newEmail: Email = {
        id: Date.now().toString(),
        sender: currentUser?.email || '',
        recipient,
        subject,
        body,
        encrypted,
        timestamp: new Date().toISOString(),
        read: true
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update sent emails
      setSentEmails(prev => [newEmail, ...prev]);
      
      // Update encrypted emails if applicable
      if (encrypted) {
        setEncryptedEmails(prev => [newEmail, ...prev]);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to send email');
      console.error('Send email failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Handle section change
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSelectedEmail(null);
  };
  
  // Handle email selection
  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    
    // Mark as read if it wasn't already
    if (!email.read) {
      // In a real app, this would be an API call to mark as read
      // Update the email in the appropriate list
      const updatedEmail = { ...email, read: true };
      
      if (activeSection === 'inbox') {
        setInboxEmails(prev => 
          prev.map(e => e.id === email.id ? updatedEmail : e)
        );
      } else if (activeSection === 'sent') {
        setSentEmails(prev => 
          prev.map(e => e.id === email.id ? updatedEmail : e)
        );
      } else if (activeSection === 'encrypted') {
        setEncryptedEmails(prev => 
          prev.map(e => e.id === email.id ? updatedEmail : e)
        );
      }
    }
  };
  
  // Handle compose button click
  const handleComposeClick = () => {
    setShowComposeModal(true);
  };
  
  // Main app styles
  const appStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    width: '100%',
    backgroundColor: '#131825',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  };
  
  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <div style={appStyle}>
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        encryptionActive={true}
      />
      
      {/* Email List */}
      <EmailList 
        emails={getDisplayedEmails()} 
        onSelectEmail={handleSelectEmail}
        selectedEmailId={selectedEmail?.id || null}
      />
      
      {/* Email Detail */}
      <EmailDetail email={selectedEmail} />
      
      {/* Compose Email Modal */}
      {showComposeModal && (
        <ComposeEmail 
          onClose={() => setShowComposeModal(false)}
          onSend={handleSendEmail}
        />
      )}
      
      {/* Floating Compose Button */}
      <div 
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#3b82f6',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          fontSize: '24px',
          zIndex: 100
        }}
        onClick={handleComposeClick}
      >
        +
      </div>
    </div>
  );
};

export default App;
