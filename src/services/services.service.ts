import { Injectable } from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad Service
import { Service } from './service.entity';
// importamos DTO para dar formato de productos(TuriTop) a Services(BBDD)
import { SyncServiceDto } from './dto/sync-service.dto';
// importamos el servicio TuriTop para la sincronización de servicios
import { TuritopService } from '../turitop/turitop.service';

@Injectable()
export class ServicesService {
  constructor(
    // inyectamos el repositorio de la entidad "Service"
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    // inyectamos TuritopService para las llamadas a la API de TuriTop
    private readonly turitopService: TuritopService,
  ) {}

  // método para obtener el listado entero de los servicios
  async findAll(): Promise<Service[]> {
    return await this.servicesRepository.find();
  }

  // método para recuperar un servicio específico
  async findOne(id: number): Promise<Service | null> {
    return await this.servicesRepository.findOne({ where: { id } });
  }

  // método para sincronizar los servicios desde TuriTop en la BBDD local
  async syncServices(): Promise<void> {
    // obtenemos los productos de TuriTop (ya filtrados: solo tours propios)
    const products = await this.turitopService.getProducts();

    // transformamos los productos de TuriTop al formato del DTO
    const servicesToSync = products.map((p) => SyncServiceDto.fromTuriTop(p));

    // obtenemos todos los servicios que hay actualmente en la BBDD
    const existingServices = await this.servicesRepository.find();

    // IDs de TuriTop que vienen en la respuesta
    const incomingIds = servicesToSync.map((s) => s.turitop_product_id);

    // borramos los servicios que ya no existen en TuriTop
    for (const existing of existingServices) {
      if (!incomingIds.includes(existing.turitop_product_id)) {
        await this.servicesRepository.delete(existing.id);
      }
    }

    // creamos o actualizamos los que vienen en la respuesta
    for (const serviceData of servicesToSync) {
      const existing = await this.servicesRepository.findOne({
        where: { turitop_product_id: serviceData.turitop_product_id },
      });
      if (existing) {
        await this.servicesRepository.update(existing.id, serviceData);
      } else {
        await this.servicesRepository.save(serviceData);
      }
    }
  }

  // método para eliminar un servicio
  async remove(id: number): Promise<void> {
    await this.servicesRepository.delete(id);
  }
}
