// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
// importamos el servicio
import { GuideAvailabilityService } from './guide-availability.service';
// el DTO para crear disponibilidades
import { CreateGuideAvailabilityDto } from './dto/create-guide-availability.dto';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('guide-availability')
export class GuideAvailabilityController {
  constructor(
    private readonly guideAvailabilityService: GuideAvailabilityService,
  ) {}

  // método para obtener las disponibilidades con filtros opcionales
  // (todos, por guía o por rango de tiempo)
  @Get()
  findAll(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('startDatetime') startDatetime?: string,
    @Query('endDatetime') endDatetime?: string,
  ) {
    if (userId) return this.guideAvailabilityService.findByUser(userId);
    if (startDatetime && endDatetime) {
      return this.guideAvailabilityService.findAvailableGuides(
        new Date(startDatetime),
        new Date(endDatetime),
      );
    }
    return this.guideAvailabilityService.findAll();
  }

  // método para crear nuevas disponibilidades
  @Post()
  create(@Body() guideAvailability: CreateGuideAvailabilityDto) {
    return this.guideAvailabilityService.create(guideAvailability);
  }

  // método para borrar una disponibilidad
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guideAvailabilityService.remove(id);
  }
}
