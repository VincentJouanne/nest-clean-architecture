// Must be first
import 'source-map-support/register';

// Imports from "nest"
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { middleware as expressCtx } from 'express-ctx';

// Imports from "api-gateway"
import { AppModule } from '@app/api-gateway/app.module';

// Imports from "core"
import { CoreLogger } from 'common/logger/src/adapters/pinoLogger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(CoreLogger);
  logger.setContext('main');
  app.useLogger(logger);

  const options = new DocumentBuilder()
    .setTitle('Nest Clean Architecture FP Demo')
    .setVersion('1.0')
    .setDescription(
      `## REST
      Routes are following REST standard (Richardson level 3)
    `,
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.use(expressCtx);
  // Starts listening for shutdown hooks
  if (process.env.NODE_ENV !== 'test') {
    app.enableShutdownHooks();
  }

  await app.listen(3000);
  logger.log('API-Gateway is listening on port 3000');
}
bootstrap();
