// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
// importamos el servicio
import { GuideServicesService } from './guide-services.service';
// el DTO para crear y actualizar servicios
import { CreateUpdateGuideServiceDto } from './dto/create-update-guide-service.dto';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
// drop para la paginación
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('guide-services')
export class GuideServicesController {
  constructor(private readonly guideServicesService: GuideServicesService) {}

  // endpoint para obtener relaciones guía-servicio con filtros opcionales
  // (todos, por guía o servicio)
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @Get()
  findAll(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('serviceId', new ParseIntPipe({ optional: true }))
    serviceId?: number,
    @Query() pagination?: PaginationDto,
  ) {
    if (userId) return this.guideServicesService.findByUser(userId);
    if (serviceId) return this.guideServicesService.findByService(serviceId);
    return this.guideServicesService.findAll(
      pagination?.page,
      pagination?.limit,
    );
  }

  // endpoint para crear nuevas relaciones guía-servicio
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() guideService: CreateUpdateGuideServiceDto) {
    return this.guideServicesService.create(guideService);
  }

  // método para actualizar una relación guía-servicio
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() guideService: CreateUpdateGuideServiceDto,
  ) {
    return this.guideServicesService.update(id, guideService);
  }

  // endpoint para borrar una relación guía-servicio
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guideServicesService.remove(id);
  }
}
