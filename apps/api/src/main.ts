import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  
  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'https://dane.pms' // add other production domains here
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen(process.env.PORT ?? 3001);
  console.log('\x1b[32m%s\x1b[0m', '----------------------------------');
  console.log('\x1b[33m%s\x1b[0m', 'WHOAAA API IS ON! LFG 🔥');
  console.log('\x1b[32m%s\x1b[0m', '----------------------------------');
}
bootstrap();

