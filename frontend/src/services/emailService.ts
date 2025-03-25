import axios from 'axios';

// Use a constant for the API URL since we're in development mode
const API_URL = 'http://localhost:8080/api';

// Get all emails for the current user
export const getEmails = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `${API_URL}/emails`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch emails');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Get a specific email by ID
export const getEmailById = async (emailId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `${API_URL}/emails/${emailId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch email');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Send a new email
export const sendEmail = async (emailData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/emails`,
      emailData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to send email');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Delete an email
export const deleteEmail = async (emailId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.delete(
      `${API_URL}/emails/${emailId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete email');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Mark an email as read
export const markAsRead = async (emailId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.patch(
      `${API_URL}/emails/${emailId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to mark email as read');
    }
    throw new Error('Network error. Please try again.');
  }
};

// For demo/testing purposes
export const getMockEmails = () => {
  return [
    {
      id: '1',
      sender: 'alice@quantum-mail.com',
      subject: 'Welcome to Quantum Mail',
      preview: 'Thank you for joining our quantum-secure email platform...',
      content: 'Thank you for joining our quantum-secure email platform. Your communications are now protected with post-quantum cryptography, ensuring that your messages remain private even in the era of quantum computing. Let us know if you have any questions!',
      timestamp: '2025-03-25 10:30 AM',
      isEncrypted: true,
      isRead: false
    },
    {
      id: '2',
      sender: 'bob@quantum-mail.com',
      subject: 'Project Update',
      preview: 'Here is the latest update on our quantum computing project...',
      content: 'Here is the latest update on our quantum computing project. We have successfully implemented the lattice-based encryption algorithm and the initial tests show promising results. The next step is to integrate it with our existing systems.',
      timestamp: '2025-03-24 03:45 PM',
      isEncrypted: true,
      isRead: true
    },
    {
      id: '3',
      sender: 'security@quantum-mail.com',
      subject: 'Security Alert',
      preview: 'We detected a new login to your account from an unrecognized device...',
      content: 'We detected a new login to your account from an unrecognized device. If this was you, you can ignore this message. If not, please contact our security team immediately.',
      timestamp: '2025-03-23 08:15 AM',
      isEncrypted: false,
      isRead: true
    },
    {
      id: '4',
      sender: 'newsletter@quantum-mail.com',
      subject: 'Quantum Computing News - March 2025',
      preview: 'The latest developments in quantum computing and cryptography...',
      content: 'The latest developments in quantum computing and cryptography. This month\'s highlights include a breakthrough in quantum error correction, new post-quantum cryptographic standards, and an interview with a leading researcher in the field.',
      timestamp: '2025-03-22 11:20 AM',
      isEncrypted: false,
      isRead: false
    },
    {
      id: '5',
      sender: 'carol@quantum-mail.com',
      subject: 'Meeting Invitation',
      preview: 'You are invited to a meeting on quantum-resistant algorithms...',
      content: 'You are invited to a meeting on quantum-resistant algorithms. The meeting will take place on April 2, 2025, at 2:00 PM. We will discuss the latest advancements in post-quantum cryptography and their implications for our secure communication platform.',
      timestamp: '2025-03-21 02:10 PM',
      isEncrypted: true,
      isRead: false,
      attachments: [
        {
          id: 'a1',
          name: 'meeting_agenda.pdf',
          size: '1.2 MB'
        }
      ]
    }
  ];
};
