import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Student Portal API is running on port ${port}`);
  console.log(`WebRTC signaling server available at ws://localhost:${port}/webrtc`);
}
bootstrap();

