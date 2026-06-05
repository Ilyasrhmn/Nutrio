// Only express is imported statically. ALL NestJS/AppModule imports are dynamic
// inside bootstrap() so any module-level crash (e.g. missing DATABASE_URL) is
// caught by the try/catch AFTER CORS headers have already been sent.
import express from 'express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

const expressApp = express();
let bootstrapPromise: Promise<void> | null = null;

function applyCors(req: Request, res: Response): void {
  const rawOrigins = process.env['ALLOWED_ORIGINS'];
  const reqOrigin = req.headers['origin'] as string | undefined;

  if (rawOrigins) {
    const allowed = rawOrigins.split(',').map((o) => o.trim());
    if (reqOrigin && allowed.includes(reqOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin ?? '*');
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

async function bootstrap(): Promise<void> {
  // Dynamic imports — any crash here is caught by handler's try/catch,
  // which runs only after applyCors() has already set the response headers.
  const { NestFactory, HttpAdapterHost } = await import('@nestjs/core');
  const { ExpressAdapter } = await import('@nestjs/platform-express');
  const { ValidationPipe } = await import('@nestjs/common');

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });

  const adapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(adapterHost));
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const allowedOrigins = process.env['ALLOWED_ORIGINS']
    ? process.env['ALLOWED_ORIGINS'].split(',').map((o) => o.trim())
    : true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400,
  });

  await app.init();
}

export default async function handler(req: Request, res: Response): Promise<void> {
  // applyCors() is synchronous and runs before ANY await — guaranteed to execute
  // even if bootstrap() later throws, so preflight OPTIONS always gets 204.
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    if (!bootstrapPromise) {
      bootstrapPromise = bootstrap();
    }
    await bootstrapPromise;
    expressApp(req, res);
  } catch (err) {
    bootstrapPromise = null;
    res.status(500).json({ error: 'Bootstrap failed', message: (err as Error).message });
  }
}
