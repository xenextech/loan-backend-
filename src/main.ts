import { NestFactory, Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  // Typed as the Express app so `set('trust proxy', ...)` below is available.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'warn', 'error'],
    bodyParser: false,
  });

  // Increase body size limit to accommodate base64-encoded logo uploads
  const express = await import('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3001;

  // Rate limiting keys on req.ip, and Express only derives that from
  // X-Forwarded-For when `trust proxy` is set. Behind Nginx this must be 1 or
  // every caller looks like the proxy and shares one bucket; with no proxy it
  // must stay 0 so a forged header cannot mint a fresh bucket per request.
  const trustProxy = config.get<number>('trustProxy') ?? 0;
  if (trustProxy > 0) {
    app.set('trust proxy', trustProxy);
  } else if (config.get<string>('nodeEnv') === 'production') {
    new Logger('Bootstrap').warn(
      'TRUST_PROXY is 0 in production — if this runs behind a reverse proxy, ' +
        'every client will share a single rate-limit bucket. Set TRUST_PROXY=1.',
    );
  }

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());

  const allowedOrigins = new Set(
    [
      ...(config.get<string[]>('cors.origins') ?? []),
      config.get<string>('app.frontendUrl'),
    ].filter((origin): origin is string => Boolean(origin)),
  );
  // Dev convenience only — production must name its origins via
  // FRONTEND_URL / CORS_ORIGINS.
  if (config.get<string>('nodeEnv') !== 'production') {
    allowedOrigins.add('http://localhost:3000');
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // No Origin header means a non-browser caller (curl, server-to-server,
      // health checks) — there is no cross-origin risk to guard against.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
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
    .addTag(
      'Permissions (RBAC)',
      'Role & permission management — dynamic sidebar, widgets, and API authorization',
    )
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
