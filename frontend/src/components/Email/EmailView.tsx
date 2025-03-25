import React, { useState, useEffect } from 'react';
import { useEncryption } from '../../hooks/useEncryption';

// SVG Icons
const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ReplyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const ForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${filled ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isEncrypted: boolean;
  content?: string;
  encryptedContent?: string;
  encryptedSharedSecret?: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: string;
  }>;
  recipients?: string[];
}

interface EmailViewProps {
  email: Email;
}

const EmailView: React.FC<EmailViewProps> = ({ email }) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const { decryptEmail } = useEncryption();

  useEffect(() => {
    // Reset state when email changes
    setDecryptedContent(null);
    
    // If email is encrypted, start decryption automatically
    if (email.isEncrypted && !decryptedContent) {
      handleDecrypt();
    }
  }, [email.id]);

  const handleDecrypt = async () => {
    if (!email.isEncrypted || !email.encryptedContent || !email.encryptedSharedSecret) return;
    
    setIsDecrypting(true);
    try {
      // In a real app, we would use the actual encrypted content
      const content = await decryptEmail(email.id, email.encryptedContent, email.encryptedSharedSecret);
      setDecryptedContent(content);
    } catch (error) {
      console.error('Failed to decrypt email:', error);
    } finally {
      setIsDecrypting(false);
    }
  };

  const toggleStar = () => {
    setIsStarred(!isStarred);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Email header */}
      <div className="bg-gray-800 p-4 rounded-t-lg">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{email.subject}</h3>
          <button onClick={toggleStar} className="focus:outline-none">
            <StarIcon filled={isStarred} />
          </button>
        </div>
        
        <div className="flex justify-between text-gray-400 mt-2">
          <div>
            <p>From: <span className="text-gray-300">{email.sender}</span></p>
            {email.recipients && (
              <p>To: <span className="text-gray-300">{email.recipients.join(', ')}</span></p>
            )}
          </div>
          <div className="text-right">
            <p>{email.timestamp}</p>
            {email.isEncrypted && (
              <div className="flex items-center justify-end mt-1 text-green-500 text-sm">
                <LockClosedIcon />
                <span>Quantum Encrypted</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Email body */}
      <div className="flex-grow bg-gray-800 p-4 mt-1 rounded-b-lg overflow-y-auto">
        {email.isEncrypted && isDecrypting ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Decrypting message with quantum-resistant algorithm...</p>
          </div>
        ) : (
          <div>
            {decryptedContent ? (
              <div className="whitespace-pre-wrap text-gray-300">{decryptedContent}</div>
            ) : (
              <div className="whitespace-pre-wrap text-gray-300">{email.preview || email.content}</div>
            )}
            
            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Attachments</h4>
                <div className="space-y-2">
                  {email.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center bg-gray-700 p-2 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <div className="flex-grow">
                        <p className="text-sm text-gray-300">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{attachment.size}</p>
                      </div>
                      <button className="text-blue-400 text-sm hover:text-blue-300">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Email actions */}
      <div className="flex mt-4 space-x-2">
        <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          <ReplyIcon />
          Reply
        </button>
        <button className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          <ForwardIcon />
          Forward
        </button>
        <button className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md ml-auto">
          <TrashIcon />
          Delete
        </button>
      </div>
    </div>
  );
};

export default EmailView;
