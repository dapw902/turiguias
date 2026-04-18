// define la forma de un ticket dentro de una reserva
export interface TuriTopTicketType {
  id: number;
  name: string;
  count: number;
  seats: number;
  price_per_ticket: string;
}

// define la forma de una reserva devuelta por la API de TuriTop
export interface TuriTopBooking {
  short_id: string;
  product_short_id: string;
  date_event: number;
  status: string;
  client_data: Record<string, string>;
  ticket_type_count: TuriTopTicketType[];
  deleted: boolean;
  notes: string;
}

// define la forma de la respuesta completa de getbookings
export interface TuriTopBookingsResponse {
  data: {
    bookings: TuriTopBooking[];
  };
}
