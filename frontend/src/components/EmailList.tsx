import React from 'react';

export interface Email {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  encrypted: boolean;
  timestamp: string;
  read?: boolean;
}

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  selectedEmailId: string | null;
}

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail, selectedEmailId }) => {
  return (
    <div style={{ 
      flex: '1',
      borderRight: '1px solid #2c3344',
      backgroundColor: '#1e2533',
      overflowY: 'auto',
      height: '100vh'
    }}>
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #2c3344',
        position: 'sticky',
        top: 0,
        backgroundColor: '#1e2533',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#2a3447',
          borderRadius: '5px',
          padding: '8px 15px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search emails..." 
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              marginLeft: '10px',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div>
        {emails.length > 0 ? (
          emails.map(email => (
            <EmailItem 
              key={email.id} 
              email={email} 
              onSelect={() => onSelectEmail(email)}
              isSelected={selectedEmailId === email.id}
            />
          ))
        ) : (
          <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
            No emails to display
          </div>
        )}
      </div>
    </div>
  );
};

interface EmailItemProps {
  email: Email;
  onSelect: () => void;
  isSelected: boolean;
}

const EmailItem: React.FC<EmailItemProps> = ({ email, onSelect, isSelected }) => {
  // Format timestamp to show only hours ago
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return '2 hours ago'; // Fallback
    }
  };

  return (
    <div 
      style={{
        padding: '15px 20px',
        borderBottom: '1px solid #2c3344',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#2a3447' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s'
      }}
      onClick={onSelect}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '5px'
      }}>
        <div style={{ 
          color: email.read ? '#94a3b8' : 'white',
          fontWeight: email.read ? 'normal' : 'bold'
        }}>
          {email.sender}
        </div>
        <div style={{ color: '#94a3b8', fontSize: '14px' }}>
          {formatTimestamp(email.timestamp)}
        </div>
      </div>
      
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <div style={{ 
          color: email.read ? '#94a3b8' : 'white',
          fontWeight: email.read ? 'normal' : 'bold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {email.subject}
        </div>
        
        {email.encrypted && (
          <span style={{ marginLeft: '10px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </span>
        )}
      </div>
    </div>
  );
};

export default EmailList;
