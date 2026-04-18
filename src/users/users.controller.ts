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
// UseInterceptors intercepta la petición y procesa el archivo
// UploadedFile es un decorador para acceder al archivo subido
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// configuración de multer para guardar archivos en disco
import { diskStorage } from 'multer';
// para obtener la extensión del archivo original
import { extname } from 'path';

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

  // endpoint para subir la foto de perfil de un usuario
  @Roles(UserRole.ADMIN)
  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // solo permitimos imágenes
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('Solo se permiten imágenes'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
    }),
  )
  uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updatePhoto(
      id,
      `/uploads/photos/${file.filename}`,
    );
  }
}
