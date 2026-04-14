import { Injectable } from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad Booking
import { Booking } from './booking.entity';
// importamos el servicio TuriTop para la sincronización de reservas
import { TuritopService } from '../turitop/turitop.service';
// importamos el servicio EventsServices para buscar eventos por servicio y fecha/hora
import { EventsService } from '../events/events.service';
// importamos el DTO para darle formato a las resevas cuando se sincronizan
import { SyncBookingDto } from './dto/sync-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    // inyectamos el repositorio de la entidad "Booking"
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    // inyectamos el servicio de EventsServices
    private readonly eventsService: EventsService,
    // inyectamos TuritopService para las llamadas a la API
    private readonly turitopService: TuritopService,
  ) {}

  // método para sincronizar las reservas desde TuriTop
  async syncBookings(days: 7 | 30 = 30): Promise<void> {
    // calculamos el rango de fechas en Unix timestamps
    const now = Math.floor(Date.now() / 1000);
    const endDate = now + days * 24 * 60 * 60;

    // obtenemos las reservas de TuriTop para ese rango
    const bookings = await this.turitopService.getBookings(now, endDate);

    for (const booking of bookings) {
      // transformamos la reserva al formato de nuestra BBDD
      // decodificando entidades HTML y calculando el PAX
      const dto = SyncBookingDto.fromTuriTop(booking);

      // si la reserva fue borrada en TuriTop, la borramos de nuestra BBDD
      if (dto.deleted) {
        await this.bookingRepository.delete({
          turitop_booking_id: dto.turitop_booking_id,
        });
        continue;
      }

      // buscamos el evento correspondiente en nuestra BBDD
      const event = await this.eventsService.findByServiceAndTime(
        booking.product_short_id,
        booking.date_event,
      );

      // si no encontramos el evento, ignoramos esta reserva
      if (!event) continue;

      // verificamos si la reserva ya existe en nuestra BBDD
      const existing = await this.bookingRepository.findOne({
        where: { turitop_booking_id: dto.turitop_booking_id },
      });

      if (existing) {
        // si existe, actualizamos los datos
        await this.bookingRepository.update(existing.id, {
          pax: dto.pax,
          client_data: dto.client_data,
          ticket_type_count: dto.ticket_type_count,
          status: dto.status,
        });
      } else {
        // si no existe, creamos una nueva reserva
        await this.bookingRepository.save({
          turitop_booking_id: dto.turitop_booking_id,
          event: { id: event.id },
          pax: dto.pax,
          client_data: dto.client_data,
          ticket_type_count: dto.ticket_type_count,
          status: dto.status,
        });
      }
    }
  }

  // método para obtener todas las reservas
  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      relations: ['event', 'group'],
    });
  }

  // método para obtener las reservas de un evento específico
  async findByEvent(eventId: number): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { event: { id: eventId } },
      relations: ['event', 'group'],
    });
  }
}
