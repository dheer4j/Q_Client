import React, { useState } from 'react';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import EmailList, { Email as EmailListEmail } from './EmailList';
import EmailView from './EmailView';
import Compose from './Compose';
import SearchBar from './SearchBar';
import EncryptionStatus from '../Common/EncryptionStatus';
import NotificationSystem from '../Common/NotificationSystem';
import { useEmailManagement } from '../../hooks/useEmailManagement';

// Custom SVG Icons
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const QuantumEmailClient: React.FC = () => {
  const { emails, loading, error } = useEmailManagement();
  const [selectedEmail, setSelectedEmail] = useState<EmailListEmail | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('Inbox');

  const handleComposeClick = () => {
    setIsComposing(true);
    setSelectedEmail(null);
  };

  const handleCloseCompose = () => {
    setIsComposing(false);
  };

  const handleEmailSelect = (email: any) => {
    setSelectedEmail(email);
    setIsComposing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFolderSelect = (folder: string) => {
    setActiveFolder(folder);
    setSelectedEmail(null);
  };

  // Filter emails based on search query and active folder
  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchQuery === '' || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = activeFolder === 'Encrypted' 
      ? email.isEncrypted 
      : true; // For now, we're not filtering by folder other than 'Encrypted'
    
    return matchesSearch && matchesFolder;
  }).map(email => ({
    ...email,
    preview: email.content.substring(0, 100) + (email.content.length > 100 ? '...' : '')
  }));

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <Sidebar 
        activeFolder={activeFolder} 
        onFolderSelect={handleFolderSelect} 
        onComposeClick={handleComposeClick}
      />

      {/* Email List */}
      <div className="w-96 bg-gray-800 border-r border-gray-700 p-4">
        <SearchBar onSearch={handleSearch} />

        <div className="mt-4">
          <EncryptionStatus />
        </div>

        <EmailList 
          emails={filteredEmails}
          selectedEmailId={selectedEmail?.id || null}
          onEmailSelect={handleEmailSelect}
          loading={loading}
          error={error}
        />
      </div>

      {/* Email View or Compose */}
      <div className="flex-1 bg-gray-900 p-4">
        {isComposing ? (
          <Compose onClose={handleCloseCompose} />
        ) : selectedEmail ? (
          <EmailView email={selectedEmail} />
        ) : (
          <div className="text-center text-gray-500 mt-20">
            Select an email to view its contents
          </div>
        )}
      </div>

      {/* Notification System */}
      <NotificationSystem />
    </div>
  );
};

export default QuantumEmailClient;
