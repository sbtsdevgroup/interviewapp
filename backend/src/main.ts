import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Student Portal AI Interview API')
    .setDescription('API documentation for the AI-powered interview system')
    .setVersion('1.0')
    .addTag('ai')
    .addTag('auth')
    .addTag('students')
    .addTag('notifications')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Student Portal API',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Student Portal API is running on port ${port}`);
  console.log("Swagger documentation available at /api/docs")
  console.log(`WebRTC signaling server available on port ${port} at /webrtc`);
}
bootstrap();

