import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad Group que representa la tabla groups
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
// importamos la entidad Booking para acceder a las reservas del evento
import { Booking } from '../bookings/booking.entity';
// importamos el módulo de GuideAvailability para buscar guías disponibles
import { GuideAvailabilityModule } from '../guide-availability/guide-availability.module';
// importamos el módulo de Events para buscar el evento
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, Booking]),
    GuideAvailabilityModule,
    EventsModule,
  ],
  providers: [GroupsService],
  controllers: [GroupsController],
  // exportamos el servicio GroupsService para que otros módulos puedan usarlo
  exports: [GroupsService],
})
export class GroupsModule {}
