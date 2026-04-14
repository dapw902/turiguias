// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
// importamos el servicio
import { ServicesService } from './services.service';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // endpoint para obtener el listado entero de los servicios
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  // endpoint para recuperar un servicio específico
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  // endpoint para sincronizar los servicios desde TuriTop
  @Post('sync')
  sync() {
    return this.servicesService.syncServices();
  }

  // endpoint para borrar un servicio
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }
}
