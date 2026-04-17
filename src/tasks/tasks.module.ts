import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
// importamos los módulos necesarios para el sync
import { ServicesModule } from '../services/services.module';
import { EventsModule } from '../events/events.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  // importamos los tres módulos de los servicios que usaremos para sincronizar
  imports: [ServicesModule, EventsModule, BookingsModule],
  providers: [TasksService],
})
export class TasksModule {}
