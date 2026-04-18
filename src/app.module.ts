import { Module } from '@nestjs/common';
// importamos APP_GUARD y el guard que creamos para los roles
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
// guard para verificar el token JWT
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ConfigModule lee el archivo .env
// ConfigService permite leer variables del .env donde se necesiten
import { ConfigModule, ConfigService } from '@nestjs/config';

// Conecta NestJS con la base de datos MariaDB
import { TypeOrmModule } from '@nestjs/typeorm';
//  Diferentes módulos de la apps
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GuideServicesModule } from './guide-services/guide-services.module';
import { ServicesModule } from './services/services.module';
import { GuideAvailabilityModule } from './guide-availability/guide-availability.module';
import { EventsModule } from './events/events.module';
import { TuritopModule } from './turitop/turitop.module';
import { BookingsModule } from './bookings/bookings.module';
import { GroupsModule } from './groups/groups.module';
// para el Cron de sincronización automática
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { WebhooksModule } from './webhooks/webhooks.module';

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

    GuideAvailabilityModule,

    EventsModule,

    TuritopModule,

    BookingsModule,

    GroupsModule,

    ScheduleModule.forRoot(),

    TasksModule,

    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // guard global JWT para verificar el token en cada endpoint
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // guard global de roles para verificar el rol del usuario en cada endpoint
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
