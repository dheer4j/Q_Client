import React, { useState, createContext, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  removeNotification: (id: string) => void;
}

// Create context with default values
export const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

// Provider component
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add a new notification
  const addNotification = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const newNotification: Notification = {
      id: uuidv4(),
      type,
      message,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  // Remove a notification by ID
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

// Custom hook to use the notifications context
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  
  return context;
};

export default useNotifications;
