// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import { Controller, Post, Query, UseGuards } from '@nestjs/common';
// importamos el servicio
import { EventsService } from './events.service';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // endpoint para sincronizar eventos desde TuriTop
  @Post('sync-events')
  syncEvents(@Query('days') days?: string) {
    const parsedDays = days === '7' ? 7 : 30;
    return this.eventsService.syncEvents(parsedDays);
  }
}
