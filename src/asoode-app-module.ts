import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { SocketModule } from './socket/socket.module';
import { AppModule } from './app/app.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.APP_ENV !== undefined,
    }),
    QueueModule,
    SocketModule,
    AppModule,
  ],
  controllers: [],
  providers: [],
})
export class AsoodeAppModule {}
