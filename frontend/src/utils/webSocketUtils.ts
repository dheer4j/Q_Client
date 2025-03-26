/**
 * Utility functions for handling WebSocket communication
 */

// Types for WebSocket messages
export interface WebSocketMessage {
  message_type: WebSocketMessageType;
  sender_id?: string;
  recipient_id?: string;
  payload: any;
  timestamp: string;
}

export type WebSocketMessageType = 
  | 'new_email'
  | 'email_read'
  | 'typing_indicator'
  | 'user_online'
  | 'user_offline'
  | 'encryption_status'
  | 'key_rotation'
  | 'error';

// Create a new email message
export const createNewEmailMessage = (senderId: string, recipientId: string, emailData: any): WebSocketMessage => {
  return {
    message_type: 'new_email',
    sender_id: senderId,
    recipient_id: recipientId,
    payload: emailData,
    timestamp: new Date().toISOString()
  };
};

// Create an email read message
export const createEmailReadMessage = (senderId: string, emailId: string): WebSocketMessage => {
  return {
    message_type: 'email_read',
    sender_id: senderId,
    payload: { email_id: emailId },
    timestamp: new Date().toISOString()
  };
};

// Create a typing indicator message
export const createTypingIndicatorMessage = (senderId: string, recipientId: string, isTyping: boolean): WebSocketMessage => {
  return {
    message_type: 'typing_indicator',
    sender_id: senderId,
    recipient_id: recipientId,
    payload: { is_typing: isTyping },
    timestamp: new Date().toISOString()
  };
};

// Create a user online message
export const createUserOnlineMessage = (userId: string, username: string): WebSocketMessage => {
  return {
    message_type: 'user_online',
    sender_id: userId,
    payload: { username },
    timestamp: new Date().toISOString()
  };
};

// Create a user offline message
export const createUserOfflineMessage = (userId: string): WebSocketMessage => {
  return {
    message_type: 'user_offline',
    sender_id: userId,
    payload: {},
    timestamp: new Date().toISOString()
  };
};

// Create an encryption status message
export const createEncryptionStatusMessage = (userId: string, status: string, details: any): WebSocketMessage => {
  return {
    message_type: 'encryption_status',
    sender_id: userId,
    payload: {
      status,
      details
    },
    timestamp: new Date().toISOString()
  };
};

// Create a key rotation message
export const createKeyRotationMessage = (userId: string, keyId: string): WebSocketMessage => {
  return {
    message_type: 'key_rotation',
    sender_id: userId,
    payload: { key_id: keyId },
    timestamp: new Date().toISOString()
  };
};

// Create an error message
export const createErrorMessage = (errorMessage: string): WebSocketMessage => {
  return {
    message_type: 'error',
    payload: { message: errorMessage },
    timestamp: new Date().toISOString()
  };
};

// Parse a WebSocket message
export const parseWebSocketMessage = (messageData: string): WebSocketMessage | null => {
  try {
    return JSON.parse(messageData) as WebSocketMessage;
  } catch (error) {
    console.error('Failed to parse WebSocket message:', error);
    return null;
  }
};
