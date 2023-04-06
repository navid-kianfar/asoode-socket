import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import * as webPush from 'web-push';
import { AsoodeAppModule } from './asoode-app-module';

async function bootstrap() {
  const port = parseInt(process.env.APP_PORT || '3000');
  const app = await NestFactory.create(AsoodeAppModule);
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.enableCors();

  webPush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC,
    process.env.VAPID_PRIVATE,
  );

  await app.listen(port);
}

bootstrap();
