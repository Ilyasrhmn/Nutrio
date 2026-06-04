import 'reflect-metadata';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

const expressApp = express();
let bootstrapPromise: Promise<void> | null = null;

function applyCors(req: Request, res: Response) {
  const rawOrigins = process.env['ALLOWED_ORIGINS'];
  const reqOrigin = req.headers['origin'] as string | undefined;

  if (rawOrigins) {
    const allowed = rawOrigins.split(',').map((o) => o.trim());
    res.setHeader('Access-Control-Allow-Origin', allowed.includes(reqOrigin ?? '') ? reqOrigin! : allowed[0]);
  } else {
    // No restriction configured — allow all
    res.setHeader('Access-Control-Allow-Origin', reqOrigin ?? '*');
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

async function bootstrap() {
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

export default async function handler(req: Request, res: Response) {
  // CORS headers are set FIRST — before any async work — so preflight never fails
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (!bootstrapPromise) {
      bootstrapPromise = bootstrap();
    }
    await bootstrapPromise;
    expressApp(req, res);
  } catch (err) {
    bootstrapPromise = null; // retry on next request
    res.status(500).json({ error: 'Bootstrap failed', message: (err as Error).message });
  }
}
