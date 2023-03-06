import React, { useContext, useRef, useState } from "react";

export type NotificationsState = {
  notificationAdded: (notification: Notification) => void;
  notificationDeleted: (id: number) => void;
  notifications: Notification[];
};

export type Notification = {
  type: "error" | "info" | "warning" | "success";
  text: string;
  id?: number;
};

export const useNotifications = (): NotificationsState => {
  return useContext(NotificationsContext);
};

export const NotificationsContext = React.createContext(null);

export default function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const id = useRef(0);

  const notificationAdded = (notification: Notification) => {
    const _notifications = [...notifications];

    _notifications.push({
      ...notification,
      id: id.current,
    });

    const _id = id.current;
    setTimeout(() => {
      notificationDeleted(_id);
    }, 8000);

    id.current = id.current + 1;

    if (_notifications.length > 8) {
      _notifications.shift();
    }

    setNotifications(_notifications);
  };

  const notificationDeleted = (id: number) => {
    setNotifications((currentNotifications) => {
      const _notifications = [...currentNotifications];
      const index = _notifications.findIndex((el) => el.id === id);
      if (index !== -1) {
        _notifications.splice(index, 1);
      }
      return _notifications;
    });
  };

  return (
    <NotificationsContext.Provider
      value={{
        notificationAdded,
        notificationDeleted,
        notifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
