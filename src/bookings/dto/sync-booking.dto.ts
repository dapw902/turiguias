// import para usar la interfaz de las reservas de TuriTop
import { TuriTopBooking } from '../../turitop/interfaces/turitop-booking.interface';
// importamos el decodificador de HTML
import * as he from 'he';

// DTO para transformar una reserva de TuriTop al formato de nuestra BBDD
export class SyncBookingDto {
  turitop_booking_id!: string;
  pax!: number;
  client_data!: Record<string, string>;
  ticket_type_count!: object;
  status!: string;
  deleted!: boolean;

  static fromTuriTop(booking: TuriTopBooking): SyncBookingDto {
    const dto = new SyncBookingDto();
    dto.turitop_booking_id = booking.short_id;
    dto.status = booking.status;
    dto.deleted = booking.deleted;
    dto.ticket_type_count = booking.ticket_type_count;

    // calculamos el total de pax sumando count * seats donde seats > 0
    dto.pax = booking.ticket_type_count
      .filter((t) => t.seats > 0)
      .reduce((sum, t) => sum + t.count * t.seats, 0);

    // decodificamos las entidades HTML del client_data
    dto.client_data = {};
    for (const [key, value] of Object.entries(booking.client_data)) {
      dto.client_data[key] = he.decode(String(value));
    }

    return dto;
  }
}
