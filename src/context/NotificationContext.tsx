// NotificationContext.tsx
import { createContext, type ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export type Notification = {
  id: number;
  message: string;
  type: NotificationType;
  duration?: number;
};

type NotificationContextType = {
  notifications: Notification[];
  show: (notification: Omit<Notification, 'id'>) => void;
  hide: (id: number) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  show: () => {},
  hide: () => {},
});

export function NotificationProvider({ children }: { children: ComponentChildren }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const show = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now();
    const duration = notification.duration || 5000;

    console.log('Creating notification:', { ...notification, id }); // Для отладки

    setNotifications(prev => [...prev, { ...notification, id }]);

    setTimeout(() => {
      hide(id);
    }, duration);
  };

  const hide = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, show, hide }}>
      {children}
      <div className="toast toast-end z-50">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`alert alert-outline ${getAlertClass(notification.type)}`}
          >
            <span>{notification.message}</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => hide(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function getAlertClass(type: NotificationType): string {
  switch (type) {
    case 'success':
      return 'alert-success';
    case 'error':
      return 'alert-error';
    case 'warning':
      return 'alert-warning';
    case 'info':
    default:
      return 'alert-info';
  }
}