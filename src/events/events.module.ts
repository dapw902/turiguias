import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad Event que representa la tabla events
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
// importamos el módulo de Services
import { ServicesModule } from '../services/services.module';
// importamos el módulo de TuriTop
import { TuritopModule } from '../turitop/turitop.module';

@Module({
  // Indicamos qué entidad vamos a usar en este módulo
  imports: [TypeOrmModule.forFeature([Event]), ServicesModule, TuritopModule],
  providers: [EventsService],
  controllers: [EventsController],
  // exportamos EventsService para que otros módulos puedan usarlo
  exports: [EventsService],
})
export class EventsModule {}
