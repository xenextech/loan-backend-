import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
    bodyParser: false,
  });

  // Increase body size limit to accommodate base64-encoded logo uploads
  const express = await import('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3001;

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: [
      config.get<string>('app.frontendUrl') ?? 'http://localhost:3000',
      'http://localhost:3000',
      'https://edu-loan-self.vercel.app',
    ],
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Global pipes / filters / interceptors ─────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );

  // ── Swagger ───────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Unnati Loan API')
    .setDescription('Education Loan Application Platform — MVP 0.1')
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('Auth', 'Authentication & account management')
    .addTag('Applications', 'Student loan applications')
    .addTag('Documents', 'File uploads & document management')
    .addTag('Admin', 'Admin dashboard & exports')
    .addTag('Utils', 'EMI calculator & eligibility checker')
    .addTag('Credit Score', 'Credit score calculation & reporting')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  console.log(`🚀  Unnati Loan API running on http://localhost:${port}/api/v1`);
  console.log(`📖  Swagger docs at  http://localhost:${port}/api/docs`);
}

bootstrap();
