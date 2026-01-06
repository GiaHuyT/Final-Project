import 'reflect-metadata';
import { config } from 'dotenv';
config(); // Load .env file
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/passport/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ BẬT CORS (QUAN TRỌNG)
  app.enableCors({
    origin: 'http://localhost:3001', // frontend
    credentials: true,
  });

  const reflector = app.get(Reflector);

  // Global Guard
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
