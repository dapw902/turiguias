import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// importamos el filtro para el manejo de excepciones
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // activamos la validación globalmente en la app
  // whitelist: true - cualquier campo que llegue
  // en la petición que no esté definido en el DTO se elimina automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  // registramos el filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());
  // configuramos CORS para que no bloquee las peticiones
  app.enableCors({
    origin: ['http://localhost:5173', 'http://46.225.164.40'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
