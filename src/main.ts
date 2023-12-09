import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from './modules/config/config.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useStaticAssets(config.SERVE_STATIC.PATH, { prefix: config.SERVE_STATIC.PREFIX });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BookSpace')
    .setDescription('BookSpace API docs')
    .setContact('', '', 'korgrbackup@gmail')
    .setVersion('0.1')
    .addBearerAuth()
    .addCookieAuth(config.COOKIE_NAME)
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDoc);

  await app.listen(config.PORT);

  Logger.log(`URL: ${await app.getUrl()}`, NestApplication.name);
}

start().then();
