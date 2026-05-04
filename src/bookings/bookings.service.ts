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
// dto para la paginación de resultados
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
// importamos ServicesService para obtener los servicios activos
import { ServicesService } from '../services/services.service';

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
    // inyectamos ServicesService para obtener los product IDs activos
    private readonly servicesService: ServicesService,
  ) {}

  // método para sincronizar las reservas desde TuriTop
  async syncBookings(days: 7 | 30 = 30): Promise<void> {
    // calculamos el rango de fechas en Unix timestamps
    // empezamos desde 3 días atrás para capturar cambios en reservas recientes
    const now = Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60;
    const endDate = now + days * 24 * 60 * 60;

    // obtenemos los servicios activos para iterar por producto y día
    const services = await this.servicesService.findAllRaw();
    const productShortIds = services
      .filter((s) => s.active)
      .map((s) => s.turitop_product_id);

    // obtenemos las reservas de TuriTop para ese rango
    const bookings = await this.turitopService.getBookings(
      now,
      endDate,
      productShortIds,
    );
    /* log temporal para ver errores 
    console.log('Total bookings recibidos:', bookings.length);
    console.log('Productos únicos:', [
      ...new Set(bookings.map((b) => b.product_short_id)),
    ]);
    console.log(
      'Deleted:',
      bookings.filter((b) => b.deleted).map((b) => b.short_id),
    );
    */

    for (const booking of bookings) {
      // transformamos la reserva al formato de nuestra BBDD
      // decodificando entidades HTML y calculando el PAX
      const dto = SyncBookingDto.fromTuriTop(booking);

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
          notes: dto.notes,
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
          notes: dto.notes,
        });
      }
    }

    // si la reserva que ya estaba registrada fue borrada en TuriTop, cambiamos su estado a 'deleted'.
    // obtenemos los IDs de las reservas que vinieron en la respuesta
    const incomingIds = bookings.map((b) => b.short_id);

    // buscamos las reservas activas en nuestra BBDD para ese rango
    const existingBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.event', 'event')
      .where('event.event_time BETWEEN :start AND :end', {
        start: now,
        end: endDate,
      })
      .andWhere('booking.status != :deleted', { deleted: 'deleted' })
      .getMany();

    // las que no vinieron en la respuesta, las marcamos como deleted
    for (const existing of existingBookings) {
      if (!incomingIds.includes(existing.turitop_booking_id)) {
        await this.bookingRepository.update(existing.id, { status: 'deleted' });
      }
    }
  }

  // método para obtener todas las reservas con paginación
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<Booking>> {
    // contamos el total de reservas
    const total = await this.bookingRepository.count();

    // obtenemos las reservas de la página solicitada
    const data = await this.bookingRepository.find({
      relations: ['event', 'group'],
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // método para obtener las reservas de un evento específico
  async findByEvent(eventId: number): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { event: { id: eventId } },
      relations: ['event', 'group'],
    });
  }
}
