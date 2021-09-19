// Must be first
// Imports from "api-gateway"
import { AppModule } from '@app/api-gateway/app.module';
// Imports from "core"
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
// Imports from "nest"
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { middleware as expressCtx } from 'express-ctx';
import 'source-map-support/register';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(PinoLoggerService);
  logger.setContext('main');
  app.useLogger(logger);

  const options = new DocumentBuilder()
    .setTitle('Nest Clean Architecture FP Demo')
    .setVersion('1.0')
    .setDescription(
      `### REST

Routes is following REST standard (Richardson level 3)

<details><summary>Detailed specification</summary>
<p>

**List:**
  - \`GET /<resources>/\`
    - Get the list of **<resources>** as admin
  - \`GET /user/<user_id>/<resources>/\`
    - Get the list of **<resources>** for a given **<user_id>** 
    - Output a **403** if logged user is not **<user_id>**

**Detail:**
  - \`GET /<resources>/<resource_id>\` 
    - Get the detail for **<resources>** of id **<resource_id>**
    - Output a **404** if not found
  - \`GET /user/<user_id>/<resources>/<resource_id>\`
    - Get the list of **<resources>** for a given **user_id** 
    - Output a **404** if not found 
    - Output a **403** if:
      - Logged user is not **<user_id>** 
      - The **<user_id>** have no access to **<resource_id>**

**Creation / Edition / Replacement / Suppression:**
  - \`<METHOD>\` is:
    - **POST** for creation
    - **PATCH** for update (one or more fields)
    - **PUT** for replacement (all fields, not used)
    - **DELETE** for suppression (all fields, not used)
  - \`<METHOD> /<resources>/<resource_id>\`
    - Create **<resources>** with id **<resource_id>** as admin 
    - Output a **400** if **<resource_id>** conflicts with existing **<resources>** 
  - \`<METHOD> /user/<user_id>/<resources>/<resource_id>\`
    - Create **<resources>** with id **<resource_id>** as a given **user_id** 
    - Output a **409** if **<resource_id>** conflicts with existing **<resources>** 
    - Output a **403** if:
      - Logged user is not **<user_id>** 
      - The **<user_id>** have no access to **<resource_id>**
</p>
</details>`,
    )
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
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
