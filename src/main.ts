import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const serverConfig = config.get('server');
  const port = serverConfig.port;

  await app.listen(port);
  logger.log(`Application running on port ${ port }`);
}
bootstrap();
