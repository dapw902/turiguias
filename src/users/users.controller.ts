// importamos los decoradores necesarios
// UseGuards: decorador para proteger endpoints con un guard
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Post,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
// Importamos el servicio
import { UsersService } from './users.service';
// y el DTO para crear nuevos usuarios
import { CreateUserDto } from './dto/create-user.dto';
// y el DTO para actualizar usuarios existentes
import { UpdateUserDto } from './dto/update-user.dto';
// importamos la entidad UserRole y el decorador para la verificación de roles
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './user.entity';
// dto para la paginación de resultados
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // endpoint para obtener el listado entero de usuarios
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination.page, pagination.limit);
  }

  // endpoint para recuperar un usuario específico
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // endpoint para borrar a un usuario
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // endpoint para crear a un usuario
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // endpoint para actualizar a un usuario
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
}
