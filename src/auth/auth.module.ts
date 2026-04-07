import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
// ConfigModule lee el archivo .env
// ConfigService permite leer variables del .env donde se necesiten
import { ConfigModule, ConfigService } from '@nestjs/config';
// el módulo de usuarios
import { UsersModule } from '../users/users.module';
import type { StringValue } from 'ms';

@Module({
  imports: [
    // acceso a los usuarios para verificar credenciales
    UsersModule,
    // configuramos JWT para que lea la clave y exp time del .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (ConfigService: ConfigService) => ({
        // clave con la que se firman y verifican los tokens
        secret: ConfigService.get<string>('JWT_SECRET'),
        // tiempo de expiración
        signOptions: {
          // añadimos as any, para asegurarle a Typescript que el valor (string genérico) es compatible
          expiresIn: ConfigService.get<string>('JWT_EXPIRES_IN') as StringValue,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
