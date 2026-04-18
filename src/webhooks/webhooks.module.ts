import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
// importamos los módulos necesarios para el sync
import { ServicesModule } from '../services/services.module';
import { EventsModule } from '../events/events.module';
import { BookingsModule } from '../bookings/bookings.module';
// JwtModule para verificar la firma del webhook
import { JwtModule } from '@nestjs/jwt';
// para leer la variable 'TURITOP_WEBHOOK_SECRET' en .env
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ServicesModule,
    EventsModule,
    BookingsModule,
    // JwtModule sin configuración — usamos verify con secret dinámico
    JwtModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
