// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
// importamos el servicio
import { BookingsService } from './bookings.service';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // endpoint para sincronizar las reservas de un periodo de tiempo que se le indique
  @Post('sync')
  sync(@Query('days') days?: string) {
    const parsedDays = days === '7' ? 7 : 30;
    return this.bookingsService.syncBookings(parsedDays);
  }

  // endpoint para recuperar todas las reservas
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
