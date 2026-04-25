// importamos los decoradores necesarios
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
// importamos el servicio
import { GroupsService } from './groups.service';
// importamos dto para dar formato a la respuesta de la confirmación de los grupos
import { ConfirmGroupsDto } from './dto/confirm-groups.dto';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // endpoint para generar una propuesta de grupos para un evento
  @Roles(UserRole.ADMIN)
  @Post('generate/:eventId')
  generateGroups(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.groupsService.generateGroups(eventId);
  }

  // endpoint para confirmar y guardar los grupos propuestos
  @Roles(UserRole.ADMIN)
  @Post('confirm')
  confirmGroups(@Body() dto: ConfirmGroupsDto) {
    return this.groupsService.confirmGroups(dto);
  }

  // endpoint para asignar o cambiar el guía de un grupo
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  @Patch('assign-booking/:bookingId/to/:targetGroupId')
  assignBookingToGroup(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Param('targetGroupId', ParseIntPipe) targetGroupId: number,
  ) {
    return this.groupsService.assignBookingToGroup(bookingId, targetGroupId);
  }

  // endpoint para borrar todos los grupos no confirmados de un evento
  @Roles(UserRole.ADMIN)
  @Delete('delete/:eventId')
  deleteUnconfirmedGroups(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.groupsService.deleteGroups(eventId);
  }

  // endpoint para borrar un grupo específico no confirmado
  @Roles(UserRole.ADMIN)
  @Delete('delete/:eventId/:groupId')
  deleteGroup(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.deleteGroups(eventId, groupId);
  }
}
