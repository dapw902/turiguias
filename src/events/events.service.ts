import { Injectable } from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad GuideAvailability
import { Event } from './event.entity';
// importamos el servicio Services para la sincronización eventos-servicios
import { ServicesService } from '../services/services.service';
// importamos el servicio TuriTop para la sincronización de eventos-servicios
import { TuritopService } from '../turitop/turitop.service';
// importamos DTO para dar formato de productos(TuriTop) a Services(BBDD)
import { SyncServiceDto } from './dto/sync-service.dto';

@Injectable()
export class EventsService {
  constructor(
    // inyectamos el repositorio de la entidad "Event"
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    // inyectamos el servicio de Services
    private readonly servicesService: ServicesService,
    // inyectamos TuritopService para las llamadas a la API
    private readonly turitopService: TuritopService,
  ) {}

  // método para sincronizar los servicios desde TuriTop en la BBDD local
  async syncServices(): Promise<void> {
    // obtenemos los productos de TuriTop (ya filtrados: solo tours propios)
    const products = await this.turitopService.getProducts();

    // transformamos los productos de TuriTop al formato del DTO
    const servicesToSync = products.map((p) => SyncServiceDto.fromTuriTop(p));

    // sincronizamos con la BBDD
    await this.servicesService.syncServices(servicesToSync);
  }

  // método que sincroniza los eventos de todos los servicios desde TuriTop (ventana de 1 semana)
  async syncEvents(): Promise<void> {
    // obtenemos todos los servicios de la BBDD
    const services = await this.servicesService.findAll();

    // calculamos el rango de fechas: ahora hasta ahora + 7 días (en Unix timestamps)
    const now = Math.floor(Date.now() / 1000);
    const oneWeekLater = now + 7 * 24 * 60 * 60;

    for (const service of services) {
      // obtenemos los eventos de este servicio desde TuriTop
      const turitopEvents = await this.turitopService.getEvents(
        service.turitop_product_id,
        now,
        oneWeekLater,
      );

      // sincronizamos cada evento
      for (const event of turitopEvents) {
        await this.eventRepository.upsert(
          {
            service: { id: service.id },
            event_time: event.time,
            duration: service.duration,
            capacity: 0, // se actualizará con getAvailable en el futuro
            status: event.status,
          },
          ['service', 'event_time'],
        );
      }
    }
  }
}
