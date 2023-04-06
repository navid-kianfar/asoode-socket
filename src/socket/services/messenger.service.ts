import { Injectable } from '@nestjs/common';
import { HubService } from './hub.service';
import { QueueService } from '../../queue/services/queue.service';
import { moduleName, panelSocket } from '../../app/constants';
import { AsoodeSocketCommand } from '../models/socket.dtos';
import { SocketCommandType } from '../models/enums';
import {PushNotificationData, PushNotificationDTO, SocketNotificationData} from '../models/dtos';

@Injectable()
export class MessengerService {
  constructor(
    public readonly hub: HubService,
    public readonly queueService: QueueService,
  ) {}

  initialize() {
    this.queueService.initializeQueue();
  }

  bind() {
    this.queueService.ready.then(() => {
      const queueName = this.queueService.queueName(moduleName, panelSocket);
      this.queueService.consume(
        queueName,
        (command: AsoodeSocketCommand<any>): Promise<boolean> => {
          const handlerName = `handleCommand_${
            SocketCommandType[command.type]
          }`;
          const handler = this[handlerName]
            ? this[handlerName]
            : this.handleCommand_defaultHandler;
          return handler(this.hub, command);
        },
      );
    });
  }

  broadcast(userIds: string[], event: string, payload: any) {
    const users = this.hub.findUsers(userIds);
    users.forEach((user) => user.socket.emit(event, payload));
  }

  handleConnection(client: any) {
    const userId = client.handshake.query.userId;
    const deviceId = client.handshake.query.deviceId;
    const sessionId = client.handshake.query.sessionId;
    if (!userId || !deviceId || !sessionId) return;
    const hubSession = {
      userId,
      deviceId,
      sessionId,
      clientId: client.id,
      socket: client,
    };
    this.hub.connect(userId, hubSession);
  }

  async handleCommand_defaultHandler(
    hub: HubService,
    command: AsoodeSocketCommand<any>,
  ): Promise<boolean> {
    // NOTE: for compatibility, all the handlers should be async, even if it is not doing async operation!
    const event = `command.${SocketCommandType[command.type]}`;

    global.console.info('command', event, command.userIds);

    // NOTE: do not use this.broadcast; "this" object inside the method becomes undefined and closure creates memory leak
    const users = hub.findUsers(command.userIds);
    users.forEach((user) => user.socket.emit(event, command.payload));

    return true;
  }
  /*
  async handlePushNotification(content) {
    const parsed = JSON.parse(content) as PushNotificationData;
    if (!parsed.data || !parsed.data.users.length) return;
    const model = {
      notification: {
        body: parsed.description,
        title: parsed.title,
        vibrate: [300, 100, 400, 100, 400, 100, 400],
        requireInteraction: true,
        icon: parsed.avatar,
        data: { ...parsed.data.data, url: parsed.url },
        renotify: true,
        tag: parsed.title,
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
            global.console.log('PUSH_SENT');
          },
          err => {
            global.console.log('PUSH_FAILED');
            // global.console.error(err);
          },
        );
    });
  }
  */
}
