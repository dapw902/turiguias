// importamos los decoradores necesarios
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Post,
  Body,
} from '@nestjs/common';
// Importamos la entidad users
import { UsersService } from './users.service';
// y el DTO para crear nuevos usuarios
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // método para obtener el listado entero de usuarios
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // método para recuperar un usuario específico
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // método para borrar a un usuario
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post()
  create(@Body() CreateUserDto: CreateUserDto) {
    return this.usersService.create(CreateUserDto);
  }
}
