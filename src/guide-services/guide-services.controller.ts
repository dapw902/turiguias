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
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
// importamos el servicio
import { GuideServicesService } from './guide-services.service';
// el DTO para crear y actualizar servicios
import { CreateUpdateGuideServiceDto } from './dto/create-update-guide-service.dto';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('guide-services')
export class GuideServicesController {
  constructor(private readonly guideServicesService: GuideServicesService) {}

  // endpoint para obtener relaciones guía-servicio con filtros opcionales
  // (todos, por guía o servicio)
  @Get()
  findAll(
    @Query('userId', new ParseIntPipe({ optional: true }))
    userId?: number,
    @Query('serviceId', new ParseIntPipe({ optional: true }))
    serviceId?: number,
  ) {
    if (userId) return this.guideServicesService.findByUser(userId);
    if (serviceId) return this.guideServicesService.findByService(serviceId);
    return this.guideServicesService.findAll();
  }

  // endpoint para crear nuevas relaciones guía-servicio
  @Post()
  create(@Body() guideService: CreateUpdateGuideServiceDto) {
    return this.guideServicesService.create(guideService);
  }

  // método para actualizar una relación guía-servicio
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() guideService: CreateUpdateGuideServiceDto,
  ) {
    return this.guideServicesService.update(id, guideService);
  }

  // endpoint para borrar una relación guía-servicio
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guideServicesService.remove(id);
  }
}
