import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
  console.log('\x1b[32m%s\x1b[0m', '----------------------------------');
  console.log('\x1b[33m%s\x1b[0m', 'WHOAAA API IS ON! LFG');
  console.log('\x1b[32m%s\x1b[0m', '----------------------------------');
}
bootstrap();
