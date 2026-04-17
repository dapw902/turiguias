// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import { Controller, Post, Query } from '@nestjs/common';
// importamos el servicio
import { EventsService } from './events.service';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Roles(UserRole.ADMIN)
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
