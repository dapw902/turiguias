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
  UseGuards,
} from '@nestjs/common';
// Importamos el servicio
import { UsersService } from './users.service';
// y el DTO para crear nuevos usuarios
import { CreateUserDto } from './dto/create-user.dto';
// y el DTO para actualizar usuarios existentes
import { UpdateUserDto } from './dto/update-user.dto';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // endpoint para obtener el listado entero de usuarios
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // endpoint para recuperar un usuario específico
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // endpoint para borrar a un usuario
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // endpoint para crear a un usuario
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // endpoint para actualizar a un usuario
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
}
