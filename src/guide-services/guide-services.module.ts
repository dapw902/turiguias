import { Module } from '@nestjs/common';
import { GuideServicesService } from './guide-services.service';
import { GuideServicesController } from './guide-services.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad GuideService que representa la tabla guide_services
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuideService } from './guide-service.entity';
// importamos el módulo de Services para recuperar la zona horaria
import { ServicesModule } from '../services/services.module';
// importamos el modulo de Groups para controlar si ya hay grupos antes de borrar un servicio de un guía
import { Group } from '../groups/group.entity';

@Module({
  // Indicamos qué entidad vamos a usar en este módulo
  imports: [TypeOrmModule.forFeature([GuideService, Group]), ServicesModule],
  providers: [GuideServicesService],
  controllers: [GuideServicesController],
  // exportamos GuideService para que otros módulos puedan usarlo
  exports: [GuideServicesService],
})
export class GuideServicesModule {}
