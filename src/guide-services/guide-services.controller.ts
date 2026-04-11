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

  // método para obtener el listado entero de las relaciones guía-servicio
  @Get()
  findAll() {
    return this.guideServicesService.findAll();
  }

  // método para recuperar los guías que pueden trabajar un servicio
  @Get('service/:id')
  findByService(@Param('id', ParseIntPipe) id: number) {
    return this.guideServicesService.findByService(id);
  }

  // método para recuperar los servicios específico de un guia
  @Get('user/:id')
  findByUser(@Param('id', ParseIntPipe) id: number) {
    return this.guideServicesService.findByUser(id);
  }

  // método para crear nuevas relaciones guía-servicio
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

  // método para borrar una relación guía-servicio
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guideServicesService.remove(id);
  }
}
