import { Module } from '@nestjs/common';
import { HubService } from './services/hub.service';
import { MessengerService } from './services/messenger.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [HubService, MessengerService],
  exports: [HubService, MessengerService],
})
export class SocketModule {}
