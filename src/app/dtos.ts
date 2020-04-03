interface BaseNotification {
  url: string;
  title: string;
  avatar: string;
  description: string;
  userId: string;
  createdAt: Date;
}
export interface SocketNotificationData extends BaseNotification {
  data: {
    users: string[];
    data: any;
    type: number;
  };
}
export interface PushNotificationData extends BaseNotification {
  data: {
    users: PushNotificationDTO[];
    data: any;
    type: number;
  };
}
export interface PushNotificationDTO {
  id: string;
  userId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  expirationTime?: Date;
  createdAt: Date;
}
