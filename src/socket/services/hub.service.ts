import { Injectable } from '@nestjs/common';
import { HubSessionDto } from '../models/socket.dtos';

@Injectable()
export class HubService {
  sessions: Map<string, HubSessionDto[]> = new Map<string, HubSessionDto[]>();

  findUsers(userIds: string[]): HubSessionDto[] {
    const many = [];
    userIds.forEach((id) => many.push(this.findUser(id)));
    return many.flatMap((i) => i);
  }

  findUser(userId: string): HubSessionDto[] {
    if (this.sessions.has(userId)) {
      return this.sessions.get(userId);
    }
    return [];
  }

  connect(userId: string, session: HubSessionDto) {
    global.console.info('connect', userId, session.clientId);
    session.socket.on('disconnect', () =>
      this.disconnect(userId, session.clientId),
    );
    const sessions = this.sessions.has(userId) ? this.sessions.get(userId) : [];
    sessions.push(session);
    this.sessions.set(userId, sessions);
    // TODO: send to redis that user is online
  }

  disconnect(userId: string, clientId: string) {
    global.console.info('disconnect', userId, clientId);
    if (this.sessions.has(userId)) {
      const except = this.sessions
        .get(userId)
        .filter((i) => i.clientId != clientId);
      if (!except.length) {
        this.sessions.delete(userId);
        // TODO: send to redis that user is offline
        return;
      }
      this.sessions.set(userId, except);
    }
  }
}
