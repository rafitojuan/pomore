import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { playNotificationSound, showNotification } from '../utils';

interface NotificationContextType {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  showDesktopNotification: (title: string, message?: string, icon?: string) => void;
  playSound: (volume?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { toasts, removeToast, success, error, info, warning } = useToast();

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    switch (type) {
      case 'success':
        success(title, message);
        break;
      case 'error':
        error(title, message);
        break;
      case 'info':
        info(title, message);
        break;
      case 'warning':
        warning(title, message);
        break;
    }
  };

  const showDesktopNotification = async (title: string, message?: string, icon?: string) => {
    try {
      showNotification(title, { body: message, icon });
    } catch (error) {
      console.warn('Desktop notification failed:', error);
    }
  };

  const playSound = (volume: number = 0.7) => {
    try {
      playNotificationSound();
    } catch (error) {
      console.warn('Sound notification failed:', error);
    }
  };

  const value: NotificationContextType = {
    showToast,
    showDesktopNotification,
    playSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </NotificationContext.Provider>
  );
};