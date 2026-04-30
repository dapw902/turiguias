import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad GuideAvailability
import { GuideAvailability } from './guide-availability.entity';
// el DTO para crear las disponibilidades de los guias
import { CreateGuideAvailabilityDto } from './dto/create-guide-availability.dto';
// DTOs para dar forma a las respuestas de los endpoints
import { GuideAvailabilityByUserResponseDto } from './dto/guide-availability-response.dto';
import { AvailableGuideForEventDto } from './dto/available-guide-for-event.dto';
// importamos método para la conversión de local a UTC
import { DateTime } from 'luxon';
// importamos el servicio Guide Services para obtener la zona horaria del guía
import { GuideServicesService } from '../guide-services/guide-services.service';
// dto para paginación
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
// importamos la entidad Group
import { Group } from '../groups/group.entity';

@Injectable()
export class GuideAvailabilityService {
  constructor(
    // inyectamos el repositorio de la entidad "GuideAvailability"
    @InjectRepository(GuideAvailability)
    private readonly guideAvailabilityRepository: Repository<GuideAvailability>,
    // inyectamos GuideServicesService con forwardRef para evitar dependencia circular
    @Inject(forwardRef(() => GuideServicesService))
    private readonly guideServicesService: GuideServicesService,
    // inyectamos el repositorio de la entidad "Group"
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  // método para obtener el listado entero de las disponibilidades de los guías con paginación
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<GuideAvailabilityByUserResponseDto>> {
    // contamos el total de guías únicos con disponibilidad
    const total = await this.guideAvailabilityRepository
      .createQueryBuilder('ga')
      .select('COUNT(DISTINCT ga.user_id)', 'count')
      .getRawOne<{ count: string }>()
      .then((r) => parseInt(r?.count ?? '0'));

    // obtenemos las disponibilidades con paginación
    const results = await this.guideAvailabilityRepository.find({
      relations: ['user'],
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
    // verificamos que el guía tiene servicios asignados para conocer su zona horaria
    // un guía debe tener al menos un servicio antes de poder crear disponibilidad
    const guideServices = await this.guideServicesService.findByUser(
      createGuideAvailabilityDto.user_id,
    );

    if (guideServices.length === 0 || guideServices[0].services.length === 0) {
      throw new ConflictException(
        'El guía no tiene servicios asignados. Asigna al menos un servicio antes de crear disponibilidad',
      );
    }

    // todos los servicios del guía comparten la misma zona horaria
    // por lo que tomamos la zona horaria del primer servicio asignado
    const guideTimezone = guideServices[0].services[0].timezone;

    // convertimos las horas de la zona horaria del guía a UTC antes de guardar
    const toUtcTime = (date: string, time: string): string => {
      const dateTimeStr = `${date} ${time}`;
      const dt = DateTime.fromFormat(dateTimeStr, 'yyyy-MM-dd HH:mm', {
        zone: guideTimezone,
      });
      return dt.toUTC().toFormat('HH:mm');
    };

    const startTimeUtc = toUtcTime(
      createGuideAvailabilityDto.start_date,
      createGuideAvailabilityDto.start_time,
    );
    const endTimeUtc = toUtcTime(
      createGuideAvailabilityDto.end_date,
      createGuideAvailabilityDto.end_time,
    );

    // verificamos que no haya solapamiento con franjas existentes
    const overlap = await this.hasOverlap(
      createGuideAvailabilityDto.user_id,
      createGuideAvailabilityDto.start_date,
      createGuideAvailabilityDto.end_date,
      startTimeUtc,
      endTimeUtc,
    );

    // mensaje de error si hay solapamiento
    if (overlap) {
      throw new ConflictException(
        'La franja horaria seleccionada se solapa con una disponibilidad ya existente',
      );
    }

    return await this.guideAvailabilityRepository.save({
      user: { id: createGuideAvailabilityDto.user_id },
      start_date: createGuideAvailabilityDto.start_date,
      end_date: createGuideAvailabilityDto.end_date,
      // guardamos las horas en UTC
      start_time: startTimeUtc,
      end_time: endTimeUtc,
    });
  }

  // método para borrar una disponibilidad
  async remove(id: number, force: boolean = false): Promise<void> {
    // buscamos la disponibilidad con el user
    const availability = await this.guideAvailabilityRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!availability)
      throw new NotFoundException('Disponibilidad no encontrada');

    // buscamos grupos del guía que caigan dentro del rango de fechas de esta disponibilidad
    const affectedGroups = await this.groupRepository
      .createQueryBuilder('g')
      .innerJoin('g.event', 'e')
      .where('g.user_id = :userId', { userId: availability.user.id })
      .andWhere('DATE(FROM_UNIXTIME(e.event_time)) >= :startDate', {
        startDate: availability.start_date,
      })
      .andWhere('DATE(FROM_UNIXTIME(e.event_time)) <= :endDate', {
        endDate: availability.end_date,
      })
      .getMany();

    // si hay grupos afectados y no es force, devolvemos 409
    if (affectedGroups.length > 0 && !force) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Esta disponibilidad tiene grupos asignados',
        affectedGroups: affectedGroups.length,
      });
    }

    // si es force y hay grupos, procedemos
    if (affectedGroups.length > 0) {
      // desasignamos el guía y marcamos needs_attention en los grupos afectados
      for (const group of affectedGroups) {
        await this.groupRepository.update(group.id, {
          user: null,
          confirmed: false,
          needs_attention: true,
        });
      }
    }

    await this.guideAvailabilityRepository.delete(id);
  }

  // método para encontrar guías disponibles en un rango de tiempo concreto (Unix timestamps)
  async findAvailableGuides(
    startTimestamp: number,
    endTimestamp: number,
  ): Promise<GuideAvailabilityByUserResponseDto[]> {
    const results = await this.guideAvailabilityRepository
      .createQueryBuilder('ga')
      // cargamos los datos del usuario relacionado
      .leftJoinAndSelect('ga.user', 'user')
      // convertimos las fechas y horas de disponibilidad a Unix timestamp con UNIX_TIMESTAMP()
      // y comparamos directamente con los timestamps del evento
      // la fecha de inicio de disponibilidad es anterior o igual a la fecha del evento
      .where('ga.start_date <= DATE(FROM_UNIXTIME(:startTimestamp))', {
        startTimestamp,
      })
      // la fecha de fin de disponibilidad es posterior o igual a la fecha del evento
      .andWhere('ga.end_date >= DATE(FROM_UNIXTIME(:endTimestamp))', {
        endTimestamp,
      })
      // la hora de inicio del guía es anterior a la hora de inicio del evento
      .andWhere('ga.start_time < TIME(FROM_UNIXTIME(:startTimestamp))', {
        startTimestamp,
      })
      // la hora de fin del guía es posterior o igual a la hora de fin del evento
      .andWhere('ga.end_time >= TIME(FROM_UNIXTIME(:endTimestamp))', {
        endTimestamp,
      })
      .getMany();

    return this.groupByGuide(results);
  }

  // método para encontrar guías disponibles para un evento concreto
  // devuelve guía + capacidad para ese servicio
  async findAvailableGuidesForEvent(
    serviceId: number,
    eventTime: number,
    eventEndTime: number,
  ): Promise<AvailableGuideForEventDto[]> {
    const results = await this.guideAvailabilityRepository
      .createQueryBuilder('ga')
      .leftJoinAndSelect('ga.user', 'user')
      // filtramos por disponibilidad horaria
      .where('ga.start_date <= DATE(FROM_UNIXTIME(:eventTime))', {
        eventTime,
      })
      .andWhere('ga.end_date >= DATE(FROM_UNIXTIME(:eventEndTime))', {
        eventEndTime,
      })
      .andWhere('ga.start_time < TIME(FROM_UNIXTIME(:eventTime))', {
        eventTime,
      })
      .andWhere('ga.end_time >= TIME(FROM_UNIXTIME(:eventEndTime))', {
        eventEndTime,
      })
      // filtramos por servicio asignado
      .innerJoin(
        'guide_services',
        'gs',
        'gs.user_id = ga.user_id AND gs.service_id = :serviceId',
        { serviceId },
      )
      .addSelect('gs.capacity', 'capacity')
      .getRawAndEntities();

    // interfaz para tipar los resultados raw de la query
    interface RawGuideResult {
      user_id: number;
      user_name: string;
      capacity: number;
    }

    return results.raw.map((r: RawGuideResult) => ({
      guide_id: r.user_id,
      guide_name: r.user_name,
      capacity: r.capacity,
    }));
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
