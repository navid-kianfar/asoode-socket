import { Injectable } from '@nestjs/common';
import * as webPush from 'web-push';
import * as MessageQueue from 'amqplib';
import { StringDictionary } from '../library/dictionary';
import Config from '../app.config';
import {
  SocketNotificationData,
  PushNotificationData,
  PushNotificationDTO,
} from '../dtos';

const pushQueue = 'AsoodePushQueue';
const socketQueue = 'AsoodeSocketQueue';

@Injectable()
export class MainService {
  server: any;
  onlineUsers: StringDictionary<string[]> = new StringDictionary<string[]>();

  private sendToOne<T>(
    userId: string,
    eventName: string,
    model: T,
    onlyOne: boolean = false,
  ) {
    const clients = this.findUser(userId);
    this.sendToClients(eventName, clients, model, onlyOne);
  }
  private sendToClients<T>(
    eventName: string,
    clients: string[],
    model: T,
    onlyOne: boolean = false,
  ) {
    if (!clients.length) return;
    try {
      for (let i = 0; i < (onlyOne ? 1 : clients.length); i++) {
        const connection = this.server.sockets.sockets[clients[i]];
        if (connection) connection.emit(eventName, model);
      }
    } catch (e) {
      global.console.error(e);
    }
  }
  private sendToAll<T>(eventName: string, model: T, onlyOne: boolean = true) {
    this.onlineUsers.Values().forEach(clients => {
      this.sendToClients<T>(eventName, clients, model, onlyOne);
    });
  }
  private sendToSelected<T>(users: string[], eventName: string, model: T) {
    users.forEach(player => {
      this.sendToOne<T>(player, eventName, model);
    });
  }
  findUser(userId: string): string[] {
    if (!this.onlineUsers.ContainsKey(userId)) {
      this.onlineUsers.Add(userId, []);
    }
    return this.onlineUsers.Item(userId);
  }
  onConnect(userId: string, clientId: string): any {
    this.findUser(userId).unshift(clientId);
  }
  onDisconnect(userId: string, clientId: string) {
    const user = this.findUser(userId);
    const index = user.indexOf(clientId);
    if (index !== -1) user.splice(index, 1);
    if (user.length === 0) this.onlineUsers.Remove(userId);
  }
  bindToMessageQueue() {
    MessageQueue.connect(Config.messageQueue)
      .then(conn => conn.createChannel())
      .then(channel => {
        const options = { durable: false };
        channel.assertQueue(pushQueue, options).then(ok => {
          return channel.consume(pushQueue, msg => {
            if (msg !== null) {
              this.handlePushNotification(msg.content.toString()).then(() =>
                channel.ack(msg),
              );
            }
          });
        });
        channel.assertQueue(socketQueue, options).then(ok => {
          return channel.consume(socketQueue, msg => {
            if (msg !== null) {
              this.handleSocketNotification(msg.content.toString()).then(() =>
                channel.ack(msg),
              );
            }
          });
        });
      })
      .catch(global.console.warn);
  }

  async handlePushNotification(content) {
    const parsed = JSON.parse(content) as PushNotificationData;
    if (!parsed.data || !parsed.data.users.length) return;
    const model = {
      type: parsed.data.type,
      data: parsed.data.data,
      push: {
        title: parsed.title,
        description: parsed.description,
        avatar: parsed.avatar,
        url: parsed.url,
      },
    };
    this.sendPushNotification(parsed.data.users, 'push-notification', model);
  }
  async handleSocketNotification(content) {
    const parsed = JSON.parse(content) as SocketNotificationData;
    if (!parsed.data || !parsed.data.users.length) return;
    const model = {
      type: parsed.data.type,
      data: parsed.data.data,
      push: {
        title: parsed.title,
        description: parsed.description,
        avatar: parsed.avatar,
        url: parsed.url,
      },
    };
    this.sendToSelected(parsed.data.users, 'push-notification', model);
  }
  sendPushNotification(subscriptions: PushNotificationDTO[], eventName, data) {
    const payload = JSON.stringify(data);
    subscriptions.forEach(subscription => {
      if (
        !subscription.endpoint ||
        !subscription.auth ||
        !subscription.p256dh
      ) {
        return;
      }
      webPush
        .sendNotification(
          {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          payload,
        )
        .then(
          () => {
            global.console.log('SENT');
          },
          err => {
            global.console.error(err);
          },
        );
    });
  }
}
