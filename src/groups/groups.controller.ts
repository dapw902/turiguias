// importamos los decoradores necesarios
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
// importamos el servicio
import { GroupsService } from './groups.service';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// importamos dto para dar formato a la respuesta de la confirmación de los grupos
import { ConfirmGroupsDto } from './dto/confirm-groups.dto';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // endpoint para generar una propuesta de grupos para un evento
  @Post('generate/:eventId')
  generateGroups(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.groupsService.generateGroups(eventId);
  }

  // endpoint para confirmar y guardar los grupos propuestos
  @Post('confirm')
  confirmGroups(@Body() dto: ConfirmGroupsDto) {
    return this.groupsService.confirmGroups(dto);
  }

  // endpoint para asignar o cambiar el guía de un grupo
  @Patch('assign-guide/:id')
  assignGuide(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id') userId: number | null,
  ) {
    return this.groupsService.assignGuide(id, userId);
  }

  // endpoint para obtener los grupos de un evento
  @Get('event/:eventId')
  findByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.groupsService.findByEvent(eventId);
  }

  // endpoint para mover una reserva de un grupo a otro
  @Patch('assign-booking/:bookingId/to/:targetGroupId')
  assignBookingToGroup(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Param('targetGroupId', ParseIntPipe) targetGroupId: number,
  ) {
    return this.groupsService.assignBookingToGroup(bookingId, targetGroupId);
  }
}
