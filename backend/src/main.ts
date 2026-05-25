import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // Cho phép frontend gọi API
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Prefix chung cho tất cả API
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 8000);
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
