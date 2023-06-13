import * as bodyParser from 'body-parser';
import * as Cors from 'cors';
import * as webPush from 'web-push';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app/app.module';
import Config from './app/app.config';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {});
  app.use(bodyParser.json());
  app.use(Cors({credentials: true, origin: true}));
  webPush.setVapidDetails(
    Config.vapid.email,
    Config.vapid.public,
    Config.vapid.private,
  );
  await app.listen(Config.ports[Config.language], Config.backend.server);
}

bootstrap().then(() => {});
