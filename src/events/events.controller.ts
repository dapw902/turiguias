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
// dto para la paginación de resultados
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // endpoint para obtener eventos con filtros opcionales por fecha y servicio
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @Get()
  findAll(
    @Query('serviceId', new ParseIntPipe({ optional: true }))
    serviceId?: number,
    @Query('startTimestamp') startTimestamp?: string,
    @Query('endTimestamp') endTimestamp?: string,
    @Query('withBookings') withBookings?: string,
    @Query('guideId', new ParseIntPipe({ optional: true })) guideId?: number,
    @Query() pagination?: PaginationDto,
  ) {
    return this.eventsService.findAll(
      serviceId,
      startTimestamp ? parseInt(startTimestamp) : undefined,
      endTimestamp ? parseInt(endTimestamp) : undefined,
      pagination?.page,
      pagination?.limit,
      withBookings === 'true',
      guideId,
    );
  }

  // endpoint para obtener un evento específico por id
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  // endpoint para sincronizar eventos desde TuriTop — solo admin
  @Roles(UserRole.ADMIN)
  @Post('sync-events')
  syncEvents(@Query('days') days?: string) {
    const parsedDays = days === '7' ? 7 : 30;
    return this.eventsService.syncEvents(parsedDays);
  }
}
