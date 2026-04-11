import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ConfigModule lee el archivo .env
// ConfigService permite leer variables del .env donde se necesiten
import { ConfigModule, ConfigService } from '@nestjs/config';

// Conecta NestJS con la base de datos MariaDB
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GuideServicesModule } from './guide-services/guide-services.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    // Carga las variables de entorno del archivo .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Configura la conexión a MariaDB leyendo las credenciales del .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '3306')),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),

    UsersModule,

    AuthModule,

    GuideServicesModule,

    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
