// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Delete,
} from '@nestjs/common';
// importamos el servicio
import { ServicesService } from './services.service';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

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
  @Roles(UserRole.ADMIN)
  @Post('sync')
  sync() {
    return this.servicesService.syncServices();
  }

  // endpoint para borrar un servicio
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }
}
