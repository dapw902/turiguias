import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad Group que representa la tabla groups
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupsService],
  controllers: [GroupsController],
  // exportamos el servicio GroupsService para que otros módulos puedan usarlo
  exports: [GroupsService],
})
export class GroupsModule {}
