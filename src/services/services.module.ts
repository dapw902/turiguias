import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad Service que representa la tabla services
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';

@Module({
  // Indicamos qué entidad vamos a usar en este módulo
  imports: [TypeOrmModule.forFeature([Service])],
  providers: [ServicesService],
  controllers: [ServicesController],
  // exportamos UsersService para que otros módulos puedan usarlo
  exports: [ServicesService],
})
export class ServicesModule {}
