import { Injectable } from '@nestjs/common';
// Importamos la entidad users y también:
// InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad Service
import { Service } from './service.entity';
// el DTO para crear o actualizar servicios
import { CreateUpdateServiceDto } from './dto/create-update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    // inyectamos el repositorio de la entidad "Service"
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  // método para obtener el listado entero de los servicios
  async findAll(): Promise<Service[]> {
    return await this.servicesRepository.find();
  }

  // método para recuperar un servicio específico
  async findOne(id: number): Promise<Service | null> {
    return await this.servicesRepository.findOne({ where: { id } });
  }

  // método para crear o actualizar servicios
  async syncServices(services: CreateUpdateServiceDto[]): Promise<void> {
    await this.servicesRepository.upsert(services, ['turitop_product_id']);
  }

  // método para eliminar un servicio
  async remove(id: number): Promise<void> {
    await this.servicesRepository.delete(id);
  }
}
