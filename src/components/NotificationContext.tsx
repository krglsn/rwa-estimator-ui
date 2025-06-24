// src/context/NotificationContext.tsx
import {createContext} from 'preact';
import {useState} from 'preact/hooks';

type Notification = {
    message: string;
    type?: 'success' | 'error' | 'info';
    link?: string;
};

type NotificationContextType = {
    show: (notification: Notification) => void;
    notification: Notification | null;
};

export const NotificationContext = createContext<NotificationContextType>({
    show: () => {
    },
    notification: null,
});

export const NotificationProvider = ({children}: { children: preact.ComponentChildren }) => {
    const [notification, setNotification] = useState<Notification | null>(null);

    const show = (n: Notification) => {
        setNotification(n);
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <NotificationContext.Provider value={{show, notification}}>
            {children}
            {notification && (
                <div className={`toast toast-bottom toast-end w-max`}>
                    <div
                        className={`alert alert-${notification.type ?? 'info'} alert-outline w-max`}>
                        <span>{notification.message}</span>
                        <span>
                                {notification.link && (
                                    <>
                                        &nbsp;
                                        <a className="underline" href={notification.link} target="_blank"
                                           rel="noreferrer">
                                            View
                                        </a>
                                    </>
                                )}
                        </span>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
