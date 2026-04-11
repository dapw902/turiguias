import { Module } from '@nestjs/common';
import { GuideAvailabilityService } from './guide-availability.service';
import { GuideAvailabilityController } from './guide-availability.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad GuideAvailability que representa la tabla guide_services
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuideAvailability } from './guide-availability.entity';

@Module({
  // Indicamos qué entidad vamos a usar en este módulo
  imports: [TypeOrmModule.forFeature([GuideAvailability])],
  providers: [GuideAvailabilityService],
  controllers: [GuideAvailabilityController],
  // exportamos GuideAvailabilityService para que otros módulos puedan usarlo
  exports: [GuideAvailabilityService],
})
export class GuideAvailabilityModule {}
