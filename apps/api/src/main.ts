import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    : true; // true = allow all, safe for local dev; override with ALLOWED_ORIGINS in production

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  await app.listen(port);

  Logger.log(`🚀 API is running on http://localhost:${port}`, "Bootstrap");
}

void bootstrap();

