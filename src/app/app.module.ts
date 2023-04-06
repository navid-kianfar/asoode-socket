import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { SocketModule } from '../socket/socket.module';
import { Gateway } from './gateway';

@Module({
  imports: [QueueModule, SocketModule],
  controllers: [],
  providers: [Gateway],
})
export class AppModule {}
