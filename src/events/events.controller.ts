// importamos los decoradores necesarios
import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
// importamos el servicio
import { EventsService } from './events.service';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Roles(UserRole.ADMIN)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // endpoint para obtener eventos con filtros opcionales por fecha y servicio
  @Get()
  findAll(
    @Query('serviceId', new ParseIntPipe({ optional: true }))
    serviceId?: number,
    @Query('startTimestamp') startTimestamp?: string,
    @Query('endTimestamp') endTimestamp?: string,
  ) {
    return this.eventsService.findAll(
      serviceId,
      startTimestamp ? parseInt(startTimestamp) : undefined,
      endTimestamp ? parseInt(endTimestamp) : undefined,
    );
  }

  // endpoint para obtener un evento específico por id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  // endpoint para sincronizar eventos desde TuriTop — solo admin
  @Post('sync-events')
  syncEvents(@Query('days') days?: string) {
    const parsedDays = days === '7' ? 7 : 30;
    return this.eventsService.syncEvents(parsedDays);
  }
}
