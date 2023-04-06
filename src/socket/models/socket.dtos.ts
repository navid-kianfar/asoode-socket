import { Socket } from 'socket.io';
import { SocketCommandType } from './enums';

export interface HubSessionDto {
  sessionId: string;
  deviceId: string;
  clientId: string;
  userId: string;
  socket: Socket;
}

export interface AsoodeSocketCommand<T> {
  type: SocketCommandType;
  payload: T;
  userIds: string[];
  when: Date;
}
