import { Injectable, ConflictException } from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad GuideAvailability
import { GuideAvailability } from './guide-availability.entity';
// el DTO para crear las disponibilidades de los guias
import { CreateGuideAvailabilityDto } from './dto/create-guide-availability.dto';
// DTO para dar forma a la respuesta de los endpoints
import { GuideAvailabilityByUserResponseDto } from './dto/guide-availability-response.dto';

@Injectable()
export class GuideAvailabilityService {
  constructor(
    // inyectamos el repositorio de la entidad "GuideAvailability"
    @InjectRepository(GuideAvailability)
    private readonly guideAvailabilityRepository: Repository<GuideAvailability>,
  ) {}

  // método para obtener el listado entero de las disponibilidades de los guías
  async findAll(): Promise<GuideAvailabilityByUserResponseDto[]> {
    const results = await this.guideAvailabilityRepository.find({
      relations: ['user'],
    });
    return this.groupByGuide(results);
  }

  // método para recuperar todas las disponibilidades de un guía
  async findByUser(id: number): Promise<GuideAvailabilityByUserResponseDto[]> {
    const results = await this.guideAvailabilityRepository.find({
      where: { user: { id } },
      relations: ['user'],
    });
    return this.groupByGuide(results);
  }

  // método para crear una nueva disponibilidad
  async create(
    createGuideAvailabilityDto: CreateGuideAvailabilityDto,
  ): Promise<GuideAvailability> {
    // verificamos que no haya solapamiento con franjas existentes
    const overlap = await this.hasOverlap(
      createGuideAvailabilityDto.user_id,
      createGuideAvailabilityDto.start_date,
      createGuideAvailabilityDto.end_date,
      createGuideAvailabilityDto.start_time,
      createGuideAvailabilityDto.end_time,
    );

    if (overlap) {
      throw new ConflictException(
        'La franja horaria seleccionada se solapa con una disponibilidad ya existente',
      );
    }

    return await this.guideAvailabilityRepository.save({
      // guardamos la relación usando referencias parciales a User
      user: { id: createGuideAvailabilityDto.user_id },
      start_date: createGuideAvailabilityDto.start_date,
      end_date: createGuideAvailabilityDto.end_date,
      start_time: createGuideAvailabilityDto.start_time,
      end_time: createGuideAvailabilityDto.end_time,
    });
  }

  // método para eliminar un servicio asociado a un guía
  async remove(id: number): Promise<void> {
    await this.guideAvailabilityRepository.delete(id);
  }

  // método para encontrar guías disponibles en un rango de fecha y hora concreto
  async findAvailableGuides(
    startDatetime: Date,
    endDatetime: Date,
  ): Promise<GuideAvailabilityByUserResponseDto[]> {
    // usamos QueryBuilder para construir una consulta más compleja
    const results = await this.guideAvailabilityRepository
      .createQueryBuilder('ga')
      // cargamos los datos del usuario relacionado
      .leftJoinAndSelect('ga.user', 'user')
      // el guía debe estar disponible desde antes del inicio del evento
      .where('ga.start_date <= :startDate', {
        startDate: startDatetime.toISOString().split('T')[0],
      })
      // y seguir disponible hasta después del fin del evento
      .andWhere('ga.end_date >= :endDate', {
        endDate: endDatetime.toISOString().split('T')[0],
      })
      // el guía debe empezar a trabajar antes de que empiece el evento
      .andWhere('ga.start_time <= :startTime', {
        startTime: startDatetime.toISOString().split('T')[1].slice(0, 5),
      })
      // y seguir trabajando después de que termine el evento
      .andWhere('ga.end_time >= :endTime', {
        endTime: endDatetime.toISOString().split('T')[1].slice(0, 5),
      })
      .getMany();

    return this.groupByGuide(results);
  }

  // métodos auxiliares
  // agrupa las disponibilidades por guía
  private groupByGuide(
    results: GuideAvailability[],
  ): GuideAvailabilityByUserResponseDto[] {
    const map = new Map<number, GuideAvailabilityByUserResponseDto>();

    for (const ga of results) {
      if (!map.has(ga.user.id)) {
        map.set(ga.user.id, {
          guide_id: ga.user.id,
          guide_name: ga.user.name,
          availabilities: [],
        });
      }
      map.get(ga.user.id)!.availabilities.push({
        id: ga.id,
        start_date: ga.start_date,
        end_date: ga.end_date,
        start_time: ga.start_time.slice(0, 5),
        end_time: ga.end_time.slice(0, 5),
      });
    }

    return Array.from(map.values());
  }

  // verifica si una nueva franja se solapa con alguna existente del mismo guía
  private async hasOverlap(
    userId: number,
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<boolean> {
    const query = this.guideAvailabilityRepository
      .createQueryBuilder('ga')
      .where('ga.user_id = :userId', { userId })
      .andWhere('ga.start_date <= :endDate', { endDate })
      .andWhere('ga.end_date >= :startDate', { startDate })
      .andWhere('ga.start_time <= :endTime', { endTime })
      .andWhere('ga.end_time >= :startTime', { startTime });

    if (excludeId) {
      query.andWhere('ga.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
