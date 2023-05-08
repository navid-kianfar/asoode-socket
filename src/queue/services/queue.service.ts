import * as MessageQueue from 'amqplib';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class QueueService implements OnApplicationShutdown {
  ready: Promise<void>;
  private _assertedQueues = new Map<string, boolean>();
  private _connection: any;
  private _channel: any;

  onApplicationShutdown(signal?: string): any {
    //TODO: remove all listeners and close the connections to rabbitmq
  }

  initializeQueue() {
    this.ready = new Promise(async (resolve, reject) => {
      const rabbitTopic = process.env.RABBIT_TOPIC_GROUP;
      const rabbitServer = process.env.RABBIT_SERVER;
      const rabbitUsername = process.env.RABBIT_USERNAME;
      const rabbitPassword = process.env.RABBIT_PASSWORD;
      const endpoint = `amqp://${rabbitUsername}:${rabbitPassword}@${rabbitServer}`;
      this._connection = await MessageQueue.connect(endpoint);
      this._channel = await this._connection.createChannel();
      //TODO: bind to catch events and error handling

      resolve();
    });
  }

  queueName(moduleName: string, action: string, lang = 'en'): string {
    return `${moduleName}-${lang}-${action}`.toLowerCase();
  }

  private async assertQueue(queueName, options): Promise<void> {
    if (this._assertedQueues.has(queueName)) {
      return;
    }
    options = options || { durable: true };
    await this._channel.assertQueue(queueName, options);
    this._assertedQueues.set(queueName, true);
  }

  consume(
    queueName: string,
    callback: (json: any) => Promise<boolean>,
    options: any = null,
  ) {
    this.assertQueue(queueName, options).then(() => {
      this._channel.consume(queueName, (msg) => {
        if (!msg) {
          return this._channel.ack(msg);
        }
        const json = JSON.parse(msg.content.toString());
        callback(json).then((success) => {
          if (success) this._channel.ack(msg);
          // TODO: handle non-success cases here...
        });
      });
    });
  }

  async produce(
    queueName: string,
    payload: any,
    options: any = null,
  ): Promise<void> {
    payload = payload || {};
    await this.assertQueue(queueName, options);
    const buffer = Buffer.from(JSON.stringify(payload));
    await this._channel.sendToQueue(queueName, buffer);
  }
}
