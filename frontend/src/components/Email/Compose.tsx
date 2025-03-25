import React, { useState } from 'react';
import { useEncryption } from '../../hooks/useEncryption';

// SVG Icons
const PaperClipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface ComposeProps {
  onClose: () => void;
}

const Compose: React.FC<ComposeProps> = ({ onClose }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const { encryptEmail } = useEncryption();

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!to) {
      setError('Recipient email is required');
      return;
    }
    
    if (!subject) {
      setError('Subject is required');
      return;
    }
    
    if (!content) {
      setError('Email content is required');
      return;
    }
    
    setIsSending(true);
    setError('');
    
    try {
      // In a real app, we would send the email to the server
      if (isEncrypted) {
        await encryptEmail({
          to,
          subject,
          content,
          attachments
        });
      } else {
        // Send unencrypted email
        // This would be handled by your email service
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium">New Message</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <CloseIcon />
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-white p-3 m-4 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Compose form */}
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col p-4">
        <div className="mb-4">
          <label htmlFor="to" className="sr-only">To</label>
          <input
            id="to"
            type="email"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="subject" className="sr-only">Subject</label>
          <input
            id="subject"
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex-grow mb-4">
          <label htmlFor="content" className="sr-only">Content</label>
          <textarea
            id="content"
            placeholder="Write your message here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Attachments</h4>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-700 p-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-300">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-400 text-sm hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-gray-300 hover:text-white cursor-pointer">
              <PaperClipIcon />
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange}
                className="hidden"
              />
              <span className="ml-2">Attach</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isEncrypted}
                onChange={() => setIsEncrypted(!isEncrypted)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-700"
              />
              <span className="ml-2 flex items-center text-green-500">
                <LockClosedIcon />
                Quantum Encryption
              </span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Compose;
