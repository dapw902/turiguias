import { Module } from '@nestjs/common';
import { TuritopService } from './turitop.service';
// importamos módulos para poder hacer llamadas a la API de TuriTop
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // HttpModule para hacer llamadas HTTP a la API de TuriTop
    HttpModule,
    ConfigModule,
  ],
  providers: [TuritopService],
  // exportamos TuritopService para que otros módulos puedan usarlo
  exports: [TuritopService],
})
export class TuritopModule {}
