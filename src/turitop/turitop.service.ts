import { Injectable } from '@nestjs/common';
// importamos módulo para hacer las solicitudes a la API de TuriTop
import { HttpService } from '@nestjs/axios';
// módulo para leer las variables de .env
import { ConfigService } from '@nestjs/config';
// módulo para convertir la respuesta del HttpService
// de un Observable a un Promise que podemos usar con await
import { firstValueFrom } from 'rxjs';
// importamos las interfaces para la llamada getproducts
import {
  TuriTopProduct,
  TuriTopProductsResponse,
} from './interfaces/turitop-product.interface';
// importamos las interfaces para la llamada getevents
import {
  TuriTopEvent,
  TuriTopEventsResponse,
} from './interfaces/turitop-event.interface';
import {
  TuriTopBooking,
  TuriTopBookingsResponse,
} from './interfaces/turitop-booking.interface';

@Injectable()
export class TuritopService {
  // recuperamos la API URL y Key de TuriTop
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly language: string;

  constructor(
    // cargamos el servicio para hacer llamadas HTTP a la API de TuriTop
    private readonly httpService: HttpService,
    // y el servicio para leer las credenciales del .env
    configService: ConfigService,
  ) {
    // guardamos las credenciales como propiedades privadas de la clase
    this.apiUrl = configService.get<string>('TURITOP_API_URL')!;
    this.apiKey = configService.get<string>('TURITOP_API_KEY')!;
    this.language = configService.get<string>('TURITOP_LANGUAGE', 'es');
  }

  // obtiene todos los productos de TuriTop y devuelve solo los tours propios
  async getProducts(): Promise<TuriTopProduct[]> {
    const response = await firstValueFrom(
      this.httpService.post<TuriTopProductsResponse>(
        `${this.apiUrl}/product/getproducts`,
        {
          data: {
            language_code: this.language,
          },
        },
        this.headers,
      ),
    );

    // filtramos los productos que no son propios (reventas) y los que no son tipo tours
    return response.data.data.products.filter(
      (p) => !p.supplier_company_short_id && p.flow === 'tour',
    );
  }

  // método para obtener los eventos de un servicio concreto en un rango de tiempo (Unix timestamps)
  async getEvents(
    productShortId: string,
    startDate: number,
    endDate: number,
  ): Promise<TuriTopEvent[]> {
    const response = await firstValueFrom(
      this.httpService.post<TuriTopEventsResponse>(
        `${this.apiUrl}/product/tour/getevents`,
        {
          data: {
            product_short_id: productShortId,
            start_date: startDate,
            end_date: endDate,
            language_code: this.language,
          },
        },
        this.headers,
      ),
    );

    return response.data.data.events;
  }

  // método para sincronizar las reservas con la BBDD local
  async getBookings(
    startDate: number,
    endDate: number,
  ): Promise<TuriTopBooking[]> {
    const response = await firstValueFrom(
      this.httpService.post<TuriTopBookingsResponse>(
        `${this.apiUrl}/booking/getbookings`,
        {
          data: {
            filter: {
              event_date_from: startDate,
              event_date_to: endDate,
              show_deleted: 0,
            },
            language_code: this.language,
          },
        },
        this.headers,
      ),
    );

    return response.data.data.bookings;
  }

  // método auxiliar para el header de autenticación para todas las llamadas a TuriTop
  private get headers() {
    return {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };
  }
}
