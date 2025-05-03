
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { NotificationTemplate } from '@/models/types';

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
  notificationTemplates: NotificationTemplate[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  approvePurchase: (purchaseId: string) => void;
  rejectPurchase: (purchaseId: string) => void;
  updateNotificationTemplate: (template: NotificationTemplate) => void;
  sendWhatsAppNotification: (phoneNumber: string, message: string) => Promise<void>;
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

// Default notification templates
const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'template-1',
    name: 'Product Purchase',
    title: 'Product Purchase Confirmation',
    message: 'Thank you for purchasing {product_name}. Your access will expire on {expiry_date}.',
    type: 'purchase',
    variables: ['product_name', 'expiry_date']
  },
  {
    id: 'template-2',
    name: 'Credit Purchase',
    title: 'Credits Added',
    message: '{credit_amount} credits have been added to your account.',
    type: 'system',
    variables: ['credit_amount']
  },
  {
    id: 'template-3',
    name: 'Product Expiry',
    title: 'Product Access Expiring',
    message: 'Your access to {product_name} will expire soon.',
    type: 'expiry',
    variables: ['product_name']
  },
  {
    id: 'template-4',
    name: 'Credit Expiry',
    title: 'Credits Expiring',
    message: '{credit_amount} credits will expire soon.',
    type: 'expiry',
    variables: ['credit_amount']
  },
  {
    id: 'template-5',
    name: 'Purchase Request',
    title: 'New Purchase Request',
    message: 'User {user_name} has requested to purchase {credit_package_name} for {amount} credits.',
    type: 'purchase',
    variables: ['user_name', 'credit_package_name', 'amount']
  },
  {
    id: 'template-6',
    name: 'Purchase Approved',
    title: 'Purchase Approved',
    message: 'Your purchase request for {credit_package_name} has been approved. {credit_amount} credits have been added to your account.',
    type: 'system',
    variables: ['credit_package_name', 'credit_amount']
  },
  {
    id: 'template-7',
    name: 'Purchase Rejected',
    title: 'Purchase Rejected',
    message: 'Your purchase request for {credit_package_name} has been rejected.',
    type: 'system',
    variables: ['credit_package_name']
  }
];

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(DEFAULT_TEMPLATES);

  // Initialize notifications based on user role
  useEffect(() => {
    if (profile?.role === 'admin') {
      setNotifications(MOCK_ADMIN_NOTIFICATIONS);
    } else if (profile?.role === 'user') {
      setNotifications(MOCK_USER_NOTIFICATIONS);
    } else {
      setNotifications([]);
    }
  }, [profile]);

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
  
  const clearAllNotifications = () => {
    setNotifications([]);
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

    // In a real app, we would also send a WhatsApp notification to the user's phone
    if (profile?.phoneNumber) {
      sendWhatsAppNotification(
        profile.phoneNumber,
        'Your purchase request has been approved. Credits have been added to your account.'
      );
    }
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

    // In a real app, we would also send a WhatsApp notification to the user's phone
    if (profile?.phoneNumber) {
      sendWhatsAppNotification(
        profile.phoneNumber,
        'Your purchase request has been rejected.'
      );
    }
  };

  const updateNotificationTemplate = (updatedTemplate: NotificationTemplate) => {
    setNotificationTemplates(prev => 
      prev.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
  };

  const sendWhatsAppNotification = async (phoneNumber: string, message: string) => {
    try {
      const apiKey = localStorage.getItem('whatsapp_api_key');
      
      if (!apiKey) {
        console.error("WhatsApp API key not found");
        return;
      }

      // This would be a real API call in a production app
      console.log(`Sending WhatsApp notification to ${phoneNumber}: ${message}`);
      
      // Mock API call
      // In a real implementation, this would be:
      /*
      const response = await fetch('https://api.starsender.online/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify({
          messageType: 'text',
          to: phoneNumber,
          body: message,
          delay: 1
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send WhatsApp notification');
      }
      */
      
      // For demo purposes, let's log and return
      console.log("WhatsApp notification sent successfully!");
    } catch (error) {
      console.error("Error sending WhatsApp notification:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      notificationTemplates,
      unreadCount,
      addNotification, 
      markAsRead, 
      markAllAsRead,
      clearAllNotifications,
      approvePurchase,
      rejectPurchase,
      updateNotificationTemplate,
      sendWhatsAppNotification
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
