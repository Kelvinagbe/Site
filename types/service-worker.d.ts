// types/service-worker.d.ts
interface NotificationData {
  clickAction?: string;
  [key: string]: any;
}

interface ExtendedNotification extends Notification {
  data?: NotificationData;
}

interface NotificationEvent extends Event {
  notification: ExtendedNotification;
  action?: string;
}