import { NestApplication, NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useStaticAssets(config.SERVE_STATIC_PATH, { prefix: config.SERVE_STATIC_PREFIX });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BookSpace')
    .setDescription('BookSpace API docs')
    .setContact('', '', 'korgrbackup@gmail')
    .setVersion('0.1')
    .addBearerAuth()
    .addCookieAuth(config.COOKIE_NAME, { type: 'apiKey', description: 'does not work in browser, use generated curl' })
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDoc);

  await app.listen(config.PORT);

  Logger.log(`URL: ${await app.getUrl()}`, NestApplication.name);
}

start().then();
