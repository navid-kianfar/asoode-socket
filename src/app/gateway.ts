import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessengerService } from '../socket/services/messenger.service';

@WebSocketGateway({ cors: true })
export class Gateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server;

  constructor(private readonly messengerService: MessengerService) {
    this.messengerService.initialize();
  }

  afterInit(server: any): any {
    this.messengerService.bind();
  }

  handleConnection(client: any): any {
    this.messengerService.handleConnection(client);
  }

  // @SubscribeMessage('START-CONVERSATION')
  // startConversation(client: any, data: any) {
  //
  // }
}
