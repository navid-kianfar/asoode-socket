import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MainService } from './services/main.service';
import { MainGateway } from './gateways/main.gateway';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [MainService, MainGateway],
  exports: [],
})
export class ApplicationModule {}
