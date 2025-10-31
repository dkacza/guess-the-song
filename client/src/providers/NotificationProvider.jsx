import { createContext, useState } from "react";

export class CustomNotification {
  static idCounter = 1;
  id;
  status;
  message;

  constructor(status, message) {
    this.message = message;
    this.status = status;
    this.id = CustomNotification.idCounter;
    CustomNotification.idCounter++;
  }
}

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = function (newNotification) {
    setNotifications([...notifications, newNotification]);
  };
  const removeNotification = function (id) {
    const filteredNotifications = notifications.filter((el) => el.id != id);
    setNotifications(filteredNotifications);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
