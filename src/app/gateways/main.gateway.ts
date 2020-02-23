import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MainService } from '../services/main.service';

@WebSocketGateway()
export class MainGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly service: MainService) {}

  @WebSocketServer() server;

  afterInit(server: any): any {
    this.service.server = server;
    this.service.bindToMessageQueue();
  }

  handleConnection(client: any): any {
    const userId = client.handshake.query.userId;
    if (!userId) return;
    this.service.onConnect(userId, client.id);
  }

  handleDisconnect(client: any): any {
    const userId = client.handshake.query.userId;
    if (!userId) return;
    this.service.onDisconnect(userId, client.id);
  }
}
