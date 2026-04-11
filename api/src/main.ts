import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  // Env check on startup
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
    }
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Security headers via Helmet
  app.use(helmet());

  // CORS — restrict to known origins
  app.enableCors({
    origin: [
      'https://prosite-app-you9.vercel.app',
      'http://localhost:3001',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
  }));

  await app.listen(process.env.PORT ?? 3002);
  console.log(`API running on port ${process.env.PORT ?? 3002}`);
}
bootstrap();
