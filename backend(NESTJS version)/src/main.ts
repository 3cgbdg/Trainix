import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from "cookie-parser"
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService)
  app.use(cookieParser)
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN") || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  // global filter
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(configService.get<number>("PORT") ?? 3000, "0.0.0.0");
}
bootstrap();
