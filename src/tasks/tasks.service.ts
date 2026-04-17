import { Injectable, Logger } from '@nestjs/common';
// Cron - decorador para definir la frecuencia de ejecución de la tarea
import { Cron } from '@nestjs/schedule';
// importamos los servicios que vamos a sincronizar
import { ServicesService } from '../services/services.service';
import { EventsService } from '../events/events.service';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class TasksService {
  // Logger para registrar en el terminal cuándo se ejecuta el sync
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly servicesService: ServicesService,
    private readonly eventsService: EventsService,
    private readonly bookingsService: BookingsService,
  ) {}

  // sync automático diario (Configurado a: diario a las 2:00 a. m.)
  @Cron('0 2 * * *')
  async handleDailySync(): Promise<void> {
    this.logger.log('Iniciando sync automático diario...');

    // sincronizamos servicios, eventos y reservas con 30 días de ventana
    await this.servicesService.syncServices();
    this.logger.log('Servicios sincronizados');

    await this.eventsService.syncEvents(30);
    this.logger.log('Eventos sincronizados');

    await this.bookingsService.syncBookings(30);
    this.logger.log('Reservas sincronizadas');

    this.logger.log('Sync automático diario completado');
  }
}
