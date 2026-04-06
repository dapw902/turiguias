import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // activamos la validación globalmente en la app
  // whitelist: true - cualquier campo que llegue 
  // en la petición que no esté definido en el DTO se elimina automáticamente
  app.useGlobalPipes(new ValidationPipe({ whitelist: true}));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
