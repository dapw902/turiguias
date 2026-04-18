import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
// importamos el servicio de Servicios para recuperar la zona horaria
import { ServicesService } from '../services/services.service';
// dtop para paginación
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class GuideServicesService {
  constructor(
    // inyectamos el repositorio de la entidad "GuideService"
    @InjectRepository(GuideService)
    private readonly guideServiceRepository: Repository<GuideService>,
    private readonly servicesService: ServicesService,
  ) {}

  // método para obtener el listado entero de las relaciones guía-servicio con paginación
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<GuideServiceByUserResponseDto>> {
    // contamos el total de guías únicos
    const total = await this.guideServiceRepository
      .createQueryBuilder('gs')
      .select('COUNT(DISTINCT gs.user_id)', 'count')
      .getRawOne<{ count: string }>()
      .then((r) => parseInt(r?.count ?? '0'));

    // obtenemos las relaciones con paginación
    const results = await this.guideServiceRepository.find({
      relations: ['user', 'service'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: this.groupByGuide(results),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
    // verificamos que el servicio existe y obtenemos su zona horaria
    const newService = await this.servicesService.findOne(
      createUpdateGuideServiceDto.service_id,
    );

    if (!newService) {
      throw new NotFoundException('El servicio no existe');
    }

    // obtenemos los servicios que ya tiene asignados el guía
    const existingServices = await this.guideServiceRepository.find({
      where: { user: { id: createUpdateGuideServiceDto.user_id } },
      relations: ['service'],
    });

    // si ya tiene servicios asignados, verificamos que la zona horaria coincida
    // un guía solo puede trabajar en una zona horaria
    if (existingServices.length > 0) {
      const existingTimezone = existingServices[0].service.timezone;
      if (existingTimezone !== newService.timezone) {
        throw new ConflictException(
          `No se puede asignar este servicio — la zona horaria no coincide. ` +
            `El guía trabaja en ${existingTimezone} y este servicio es ${newService.timezone}`,
        );
      }
    }

    // guardamos la relación usando referencias parciales a User y Service
    // TypeORM traduce user: { id } → user_id en la BBDD
    // y service: { id } → service_id en la BBDD
    return await this.guideServiceRepository.save({
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
        timezone: gs.service.timezone,
        capacity: gs.capacity,
      });
    }

    return Array.from(map.values());
  }
}
