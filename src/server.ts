import * as bodyParser from 'body-parser';
import * as Cors from 'cors';
import * as webPush from 'web-push';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app/app.module';
import Config from './app/app.config';
import * as Fs from 'fs';

// import * as Path from 'path';
// const caPath = Path.resolve(__dirname, '../ssl/chain.pem');
// const certPath = Path.resolve(__dirname, '../ssl/cert.pem');
// const privatePath = Path.resolve(__dirname, '../ssl/privkey.pem');

const caPath = '/etc/letsencrypt/live/socket.' + Config.domain + '/chain.pem';
const certPath = '/etc/letsencrypt/live/socket.' + Config.domain + '/cert.pem';
const privatePath = '/etc/letsencrypt/live/socket.' + Config.domain + '/privkey.pem';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {
    httpsOptions: {
      ca: Fs.readFileSync(caPath, { encoding: 'utf-8' }),
      cert: Fs.readFileSync(certPath, { encoding: 'utf-8' }),
      key: Fs.readFileSync(privatePath, { encoding: 'utf-8' }),
    },
  });
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
