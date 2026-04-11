import { Injectable } from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad GuideService
import { GuideService } from './guide-service.entity';
// el DTO para crear o actualizar los servicios de los guias
import { CreateUpdateGuideServiceDto } from './dto/create-update-guide-service.dto';
// DTO para dar forma a la respuesta de los endpoints
import { GuideServiceByUserResponseDto } from './dto/guide-service-response.dto';

@Injectable()
export class GuideServicesService {
  constructor(
    // inyectamos el repositorio de la entidad "GuideService"
    @InjectRepository(GuideService)
    private readonly guideServiceRepository: Repository<GuideService>,
  ) {}

  // método para obtener el listado entero de las relaciones guía-servicio
  async findAll(): Promise<GuideServiceByUserResponseDto[]> {
    const results = await this.guideServiceRepository.find({
      relations: ['user', 'service'],
    });
    return this.groupByGuide(results);
  }

  // método para recuperar los guías que pueden trabajar un servicio
  async findByService(
    serviceId: number,
  ): Promise<GuideServiceByUserResponseDto[]> {
    const results = await this.guideServiceRepository.find({
      where: { service: { id: serviceId } },
      relations: ['user', 'service'],
    });
    return this.groupByGuide(results);
  }

  // método para recuperar las relaciones guía-servicios de un guía específico
  async findByUser(id: number): Promise<GuideServiceByUserResponseDto[]> {
    const results = await this.guideServiceRepository.find({
      where: { user: { id } },
      relations: ['user', 'service'],
    });
    return this.groupByGuide(results);
  }

  // método para asociar un servicio a un guía
  async create(
    createUpdateGuideServiceDto: CreateUpdateGuideServiceDto,
  ): Promise<GuideService> {
    // creamos una nueva relación entre servicio y guía
    return await this.guideServiceRepository.save({
      // guardamos la relación usando referencias parciales a User y Service
      // TypeORM traduce user: { id } → user_id en la BBDD
      // y service: { id } → service_id en la BBDD
      user: { id: createUpdateGuideServiceDto.user_id },
      service: { id: createUpdateGuideServiceDto.service_id },
      capacity: createUpdateGuideServiceDto.capacity,
    });
  }

  // método para actualizar la info de un servicio asociado a un guía
  async update(
    id: number,
    createUpdateGuideServiceDto: CreateUpdateGuideServiceDto,
  ): Promise<GuideService | null> {
    // hacermos un Update en la BBDD para actualizar la relación
    await this.guideServiceRepository.update(id, {
      user: { id: createUpdateGuideServiceDto.user_id },
      service: { id: createUpdateGuideServiceDto.service_id },
      capacity: createUpdateGuideServiceDto.capacity,
    });
    // recuperamos el registro actualizado
    return await this.guideServiceRepository.findOne({ where: { id } });
  }

  // método para eliminar un servicio asociado a un guía
  async remove(id: number): Promise<void> {
    await this.guideServiceRepository.delete(id);
  }

  // agrupa las relaciones guía-servicio por guía
  private groupByGuide(
    results: GuideService[],
  ): GuideServiceByUserResponseDto[] {
    const map = new Map<number, GuideServiceByUserResponseDto>();

    for (const gs of results) {
      if (!map.has(gs.user.id)) {
        map.set(gs.user.id, {
          guide_id: gs.user.id,
          guide_name: gs.user.name,
          services: [],
        });
      }
      map.get(gs.user.id)!.services.push({
        id: gs.id,
        service_name: gs.service.name,
        capacity: gs.capacity,
      });
    }

    return Array.from(map.values());
  }
}
