import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 걸러냄
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 오면 에러 발생
      transform: true, // 요청으로 온 데이터의 타입을 DTO에 맞게 자동 변환
    }),
  );

  await app.listen(3000);
}
bootstrap();
