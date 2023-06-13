import { HttpModule, Module } from '@nestjs/common';
import { MainService } from './services/main.service';
import { MainGateway } from './gateways/main.gateway';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [MainService, MainGateway],
  exports: [],
})
export class ApplicationModule {}
