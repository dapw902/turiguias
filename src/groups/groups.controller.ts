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
}
