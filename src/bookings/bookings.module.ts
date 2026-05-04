import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad Booking que representa la tabla bookings
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
// importamos el módulo de TuriTop
import { TuritopModule } from '../turitop/turitop.module';
// y el módulo de eventos
import { EventsModule } from '../events/events.module';
// importamos ServicesModule para poder usar ServicesService
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    TuritopModule,
    EventsModule,
    ServicesModule,
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  // exportamos el servicio BookingsServices para que otros módulos puedan usarlo
  exports: [BookingsService],
})
export class BookingsModule {}
