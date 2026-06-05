import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

// Catch crashes that happen before NestJS logger initialises
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err.message, '\n', err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason);
});

async function bootstrap() {
  console.log('[Bootstrap] starting…');

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  const port = process.env["PORT"] ?? 3333;
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const allowedOrigins = process.env['ALLOWED_ORIGINS']
    ? process.env['ALLOWED_ORIGINS'].split(',').map((o) => o.trim())
    : true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  await app.listen(port);

  Logger.log(`🚀 API is running on http://localhost:${port}`, "Bootstrap");
}

bootstrap().catch((err) => {
  console.error('[FATAL] bootstrap failed:', err.message, '\n', err.stack);
  process.exit(1);
});
