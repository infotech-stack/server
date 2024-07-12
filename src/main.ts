import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  const expressApp = express();

  // Serve static files from the 'public' directory
  expressApp.use(express.static(path.join(__dirname , "../uploads")));

  // Set Express app as NestJS app's engine
  app.use(expressApp);
  if (process.env.DEPLOYMENT_TYPE === 'development') {
    app.setGlobalPrefix('api');
    
    const options = new DocumentBuilder()
      .setTitle('Your App Name')
      .setDescription('Your App Description')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  app.enableCors();

  // await app.listen(3000);
  await app.listen(process.env.PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
