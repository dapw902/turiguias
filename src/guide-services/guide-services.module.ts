import { Module } from '@nestjs/common';
import { GuideServicesService } from './guide-services.service';
import { GuideServicesController } from './guide-services.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad GuideService que representa la tabla guide_services
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuideService } from './guide-service.entity';

@Module({
  // Indicamos qué entidad vamos a usar en este módulo
  imports: [TypeOrmModule.forFeature([GuideService])],
  providers: [GuideServicesService],
  controllers: [GuideServicesController],
  // exportamos GuideService para que otros módulos puedan usarlo
  exports: [GuideServicesService],
})
export class GuideServicesModule {}
