// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
// importamos el servicio
import { ServicesService } from './services.service';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
// dto para la paginación de resultados
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // endpoint para obtener el listado entero de los servicios
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.servicesService.findAll(pagination.page, pagination.limit);
  }

  // endpoint para recuperar un servicio específico
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
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
