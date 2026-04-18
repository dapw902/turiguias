import { Injectable, UnauthorizedException } from '@nestjs/common';
// ConfigService para leer el secret del .env
import { ConfigService } from '@nestjs/config';
// JwtService para verificar la firma del webhook
import { JwtService } from '@nestjs/jwt';
// importamos los servicios que sincronizan info en la BBDD
import { ServicesService } from '../services/services.service';
import { EventsService } from '../events/events.service';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly servicesService: ServicesService,
    private readonly eventsService: EventsService,
    private readonly bookingsService: BookingsService,
  ) {}

  // método para verificar la firma JWT del webhook
  verifySignature(token: string): boolean {
    try {
      const secret = this.configService.get<string>('TURITOP_WEBHOOK_SECRET')!;
      // console.log('Secret usado:', secret);
      this.jwtService.verify(token, { secret });
      return true;
    } catch {
      // (e: unknown) console.log('Error verificando firma:', e);
      return false;
    }
  }

  // método para procesar el webhook de TuriTop según la acción recibida
  async handleWebhook(
    payload: Record<string, unknown>,
    token?: string,
  ): Promise<void> {
    // console.log('Webhook recibido:', payload.action);
    // console.log('Token:', token);
    // console.log('Payload completo:', JSON.stringify(payload));
    // si viene token, verificamos la firma
    if (token) {
      const isValid = this.verifySignature(token);
      if (!isValid)
        throw new UnauthorizedException('Firma del webhook inválida');
    }

    const action = payload.action as string;

    // según la acción, llamamos al sync correspondiente
    switch (action) {
      case 'booking.new':
      case 'booking.update':
      case 'booking.delete':
      case 'booking.undelete':
        await this.bookingsService.syncBookings(30);
        break;
      case 'event.open':
      case 'event.close':
      case 'event.new':
      case 'event.delete':
        await this.eventsService.syncEvents(30);
        break;
      case 'product.disable':
      case 'product.enable':
        await this.servicesService.syncServices();
        break;
      default:
        // si la acción no es relevante, la ignoramos silenciosamente
        break;
    }
  }
}
