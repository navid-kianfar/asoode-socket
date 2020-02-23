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
    type: ActivityType;
  };
}
export interface PushNotificationData extends BaseNotification {
  data: {
    users: PushNotificationDTO[];
    data: any;
    type: ActivityType;
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
export enum ActivityType {
  CreateBoard = 1,
  EditBoard = 2,
  ArchiveBoard = 3,
  CreateTeam = 4,
  EditTeam = 5,
  Invite = 6,
  CreateCard = 7,
  EditCard = 8,
  ArchiveCard = 9,
  Comment = 10,
  LeaveBoard = 11,
  LeaveTeam = 12,
  CreateBoardList = 13,
  EditBoardList = 14,
  ArchiveBoardList = 15,
  MoveBoardList = 16,
  MoveCard = 17,
  RemoveBoard = 18,
  RemoveTeam = 19,
  RemoveCard = 20,
  RemoveBoardList = 21,
  ChangeOrderBoardList = 22,
  ChangeOrderCard = 23,
}
