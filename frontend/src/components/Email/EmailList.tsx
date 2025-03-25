import React from 'react';

// SVG Icons
const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isEncrypted: boolean;
  isRead?: boolean;
}

export type { Email };

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onEmailSelect: (email: Email) => void;
  loading: boolean;
  error: string | null;
}

const EmailList: React.FC<EmailListProps> = ({ 
  emails, 
  selectedEmailId, 
  onEmailSelect,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 text-white p-3 rounded-md text-sm mt-4">
        {error}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No emails found
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {emails.map((email) => (
        <div 
          key={email.id} 
          className={`p-3 rounded-md cursor-pointer transition-colors duration-150 ${
            selectedEmailId === email.id 
              ? 'bg-gray-700' 
              : 'hover:bg-gray-700'
          } ${
            !email.isRead ? 'border-l-4 border-blue-500' : ''
          }`}
          onClick={() => onEmailSelect(email)}
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold truncate max-w-[70%]">{email.sender}</span>
            <span className="text-xs text-gray-400">{email.timestamp}</span>
          </div>
          
          <p className="text-sm font-medium text-gray-300 truncate mt-1">{email.subject}</p>
          
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-400 truncate max-w-[80%]">{email.preview}</p>
            
            {email.isEncrypted && (
              <div className="flex items-center">
                <LockClosedIcon />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailList;
