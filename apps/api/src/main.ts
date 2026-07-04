import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN ?? '*';
  app.enableCors({ origin: corsOrigin, credentials: true });

  const port = parseInt(process.env.API_PORT ?? '3001', 10);
  const host = process.env.API_HOST ?? '0.0.0.0';

  await app.listen(port, host);
  console.log(`CyberDestiny API listening on http://${host}:${port}`);
}

bootstrap();
