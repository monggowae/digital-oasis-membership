
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'purchase' | 'system' | 'expiry';
  createdAt: Date;
  read: boolean;
  actionRequired?: boolean;
  purchaseId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  approvePurchase: (purchaseId: string) => void;
  rejectPurchase: (purchaseId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Mock initial notifications
const MOCK_ADMIN_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'New Purchase Request',
    message: 'User Demo User has requested to purchase Premium Package',
    type: 'purchase',
    createdAt: new Date('2023-06-20'),
    read: false,
    actionRequired: true,
    purchaseId: 'purchase-1'
  },
  {
    id: 'notif-2',
    title: 'System Update',
    message: 'System has been updated to version 2.0',
    type: 'system',
    createdAt: new Date('2023-06-15'),
    read: true
  }
];

const MOCK_USER_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-3',
    title: 'Credits Added',
    message: '50 credits have been added to your account',
    type: 'system',
    createdAt: new Date('2023-06-18'),
    read: false
  },
  {
    id: 'notif-4',
    title: 'Product Expiring Soon',
    message: 'Your access to Design Templates will expire in 5 days',
    type: 'expiry',
    createdAt: new Date('2023-06-10'),
    read: true
  }
];

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize notifications based on user role
  useEffect(() => {
    if (user?.role === 'admin') {
      setNotifications(MOCK_ADMIN_NOTIFICATIONS);
    } else if (user?.role === 'user') {
      setNotifications(MOCK_USER_NOTIFICATIONS);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    toast.info(notification.title, {
      description: notification.message,
      duration: 5000
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const approvePurchase = (purchaseId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.purchaseId !== purchaseId)
    );
    
    // Add new notification for the user (in a real app, this would be sent to the specific user)
    addNotification({
      title: 'Purchase Approved',
      message: 'Your purchase has been approved',
      type: 'system'
    });
  };

  const rejectPurchase = (purchaseId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.purchaseId !== purchaseId)
    );
    
    // Add new notification for the user (in a real app, this would be sent to the specific user)
    addNotification({
      title: 'Purchase Rejected',
      message: 'Your purchase request has been rejected',
      type: 'system'
    });
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount,
      addNotification, 
      markAsRead, 
      markAllAsRead,
      approvePurchase,
      rejectPurchase
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
