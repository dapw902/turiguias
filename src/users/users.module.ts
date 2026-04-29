import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad User que representa la tabla users
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Group } from '../groups/group.entity';

@Module({
  // Indicamos qué entidad vamos a usar en este módulo
  imports: [TypeOrmModule.forFeature([User, Group])],
  controllers: [UsersController],
  providers: [UsersService],
  // exportamos UsersService para que otros módulos puedan usarlo
  exports: [UsersService],
})
export class UsersModule {}
