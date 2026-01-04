import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import morgan from "morgan";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan(':method :url :status :response-time ms'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  // main.ts
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: [
      "http://localhost",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://connectify-mc8y.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Room-Session",
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
