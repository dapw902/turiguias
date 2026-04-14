import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
// Importamos TypeOrmModule para registrar entidades en este módulo
// y la entidad Service que representa la tabla services
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
// importamos el módulo de TuriTopModule para sincronizar los servicios
import { TuritopModule } from '../turitop/turitop.module';

@Module({
  // Indicamos qué entidad vamos a usar en este módulo
  imports: [TypeOrmModule.forFeature([Service]), TuritopModule],
  providers: [ServicesService],
  controllers: [ServicesController],
  // exportamos ServicesService para que otros módulos puedan usarlo
  exports: [ServicesService],
})
export class ServicesModule {}
