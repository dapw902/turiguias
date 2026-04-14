import { Injectable } from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad Event
import { Event } from './event.entity';
// importamos el servicio Services para la sincronización eventos-servicios
import { ServicesService } from '../services/services.service';
// importamos el servicio TuriTop para la sincronización de eventos
import { TuritopService } from '../turitop/turitop.service';
// importamos el DTO para darle formato a los eventos cuando se sincronizan
import { SyncEventDto } from './dto/sync-event.dto';

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

  // método que sincroniza los eventos de todos los servicios desde TuriTop
  async syncEvents(days: 7 | 30 = 30): Promise<void> {
    // obtenemos todos los servicios de la BBDD
    const services = await this.servicesService.findAll();

    // calculamos el rango de fechas: ahora hasta ahora + días indicados (en Unix timestamps)
    const now = Math.floor(Date.now() / 1000);
    const endDate = now + days * 24 * 60 * 60;

    for (const service of services) {
      // ignoramos servicios sin duración
      if (service.duration === 0) continue;

      // obtenemos los eventos de este servicio desde TuriTop
      const turitopEvents = await this.turitopService.getEvents(
        service.turitop_product_id,
        now,
        endDate,
      );

      for (const event of turitopEvents) {
        // transformamos el evento al formato de nuestra BBDD
        const dto = SyncEventDto.fromTuriTop(event, service.duration);

        // verificamos si el evento ya existe en nuestra BBDD
        const existing = await this.eventRepository.findOne({
          where: {
            service: { id: service.id },
            event_time: dto.event_time,
          },
        });

        if (existing) {
          // si existe, actualizamos el status y duración
          await this.eventRepository.update(existing.id, {
            duration: dto.duration,
            status: dto.status,
          });
        } else {
          // si no existe, creamos el evento
          await this.eventRepository.save({
            service: { id: service.id },
            event_time: dto.event_time,
            duration: dto.duration,
            capacity: 0,
            status: dto.status,
          });
        }
      }
    }
  }

  // método para recuperar un evento específico por id
  async findOne(id: number): Promise<Event | null> {
    return await this.eventRepository.findOne({
      where: { id },
      relations: ['service'],
    });
  }

  // método para recuperar un evento por servicio y timestamp
  async findByServiceAndTime(
    turitopProductId: string,
    eventTime: number,
  ): Promise<Event | null> {
    return await this.eventRepository.findOne({
      where: {
        service: { turitop_product_id: turitopProductId },
        event_time: eventTime,
      },
      relations: ['service'],
    });
  }
}
