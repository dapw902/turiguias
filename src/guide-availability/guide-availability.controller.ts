// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
// importamos el servicio
import { GuideAvailabilityService } from './guide-availability.service';
// el DTO para crear disponibilidades
import { CreateGuideAvailabilityDto } from './dto/create-guide-availability.dto';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('guide-availability')
export class GuideAvailabilityController {
  constructor(
    private readonly guideAvailabilityService: GuideAvailabilityService,
  ) {}

  // endpoint para obtener las disponibilidades con filtros opcionales
  // (todos, por guía o por rango de tiempo)
  @Get()
  findAll(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('startTimestamp') startTimestamp?: string,
    @Query('endTimestamp') endTimestamp?: string,
  ) {
    if (userId) return this.guideAvailabilityService.findByUser(userId);
    if (startTimestamp && endTimestamp) {
      return this.guideAvailabilityService.findAvailableGuides(
        parseInt(startTimestamp),
        parseInt(endTimestamp),
      );
    }
    return this.guideAvailabilityService.findAll();
  }

  // endpoint para crear nuevas disponibilidades
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() guideAvailability: CreateGuideAvailabilityDto) {
    return this.guideAvailabilityService.create(guideAvailability);
  }

  // endpoint para borrar una disponibilidad
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guideAvailabilityService.remove(id);
  }
}
