
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isAdmin } = useAuth();
  const { approvePurchase, rejectPurchase } = useStore();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleApprove = (purchaseId: string) => {
    approvePurchase(purchaseId);
  };

  const handleReject = (purchaseId: string) => {
    rejectPurchase(purchaseId);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] bg-red-500 text-white" 
              variant="secondary"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  
                  {isAdmin && notification.actionRequired && notification.purchaseId && (
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(notification.purchaseId!);
                          setOpen(false);
                        }}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(notification.purchaseId!);
                          setOpen(false);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
