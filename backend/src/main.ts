import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Cấu hình để truy cập file tĩnh (ảnh avatar, v.v.)
  app.useStaticAssets(join(process.cwd(), 'public'));

  app.use(cookieParser());

  // ✅ BẬT CORS (QUAN TRỌNG)
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'], // frontend
    credentials: true,
  });

  const reflector = app.get(Reflector);

  // Global Guards (JwtAuthGuard, RolesGuard) are now registered in AppModule via APP_GUARD

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Auction & E-commerce API')
    .setDescription('API toàn hệ thống')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger UI available at http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
