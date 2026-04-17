// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
// importamos el servicio
import { BookingsService } from './bookings.service';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // endpoint para sincronizar las reservas de un periodo de tiempo que se le indique
  @Roles(UserRole.ADMIN)
  @Post('sync')
  sync(@Query('days') days?: string) {
    const parsedDays = days === '7' ? 7 : 30;
    return this.bookingsService.syncBookings(parsedDays);
  }

  // endpoint para recuperar todas las reservas
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  // endpoint para recuperar todas las reservas según un id de evento específico
  @Get('event/:id')
  findByEvent(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findByEvent(id);
  }
}
