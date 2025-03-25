import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Update visible notifications when the notifications state changes
    setVisibleNotifications(notifications);
    
    // Set up auto-dismiss timers for each notification
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000); // Auto-dismiss after 5 seconds
      
      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-800 border-green-600';
      case 'error':
        return 'bg-red-800 border-red-600';
      case 'warning':
        return 'bg-yellow-800 border-yellow-600';
      case 'info':
      default:
        return 'bg-blue-800 border-blue-600';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-md">
      {visibleNotifications.map((notification) => (
        <div 
          key={notification.id}
          className={`flex items-start p-4 mb-2 border-l-4 rounded shadow-lg ${getNotificationStyles(notification.type)}`}
        >
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-white">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
