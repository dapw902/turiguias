// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import { Controller, Post, UseGuards } from '@nestjs/common';
// importamos el servicio
import { EventsService } from './events.service';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // endpoint para sincronizar los servicios
  @Post('sync-services')
  syncServices() {
    return this.eventsService.syncServices();
  }

  // endpoint para sincronizar eventos desde TuriTop
  @Post('sync-events')
  syncEvents() {
    return this.eventsService.syncEvents();
  }
}
