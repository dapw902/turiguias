import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad Group
import { Group } from './group.entity';
// importamos la entidad Booking para buscar las reservas de los eventos
import { Booking } from '../bookings/booking.entity';
// importamos el servicio de GuideAvailability para buscar guías disponibles
import { GuideAvailabilityService } from '../guide-availability/guide-availability.service';
// importamos el servicio de Events para buscar el evento
import { EventsService } from '../events/events.service';
// importamos dto para dar formato a la respuesta de la confirmación de los grupos
import { ConfirmGroupsDto } from './dto/confirm-groups.dto';
// importamos la entidad User para verificar el rol del guía
import { User, UserRole } from '../users/user.entity';
// importamos el servicio de GuideServices para ver los servicios por guía
import { GuideService } from '../guide-services/guide-service.entity';

@Injectable()
export class GroupsService {
  constructor(
    // inyectamos el repositorio de la entidad "Group"
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    // inyectamos el repositorio de la entidad "Booking"
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    // inyectamos el servicio de GuideAvailability
    private readonly guideAvailabilityService: GuideAvailabilityService,
    // inyectamos el servicio de Events
    private readonly eventsService: EventsService,
    @InjectRepository(GuideService)
    private readonly guideServiceRepository: Repository<GuideService>,
  ) {}

  // método para generar una propuesta de grupos para un evento
  async generateGroups(eventId: number): Promise<object> {
    // buscamos el evento
    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new Error('Evento no encontrado');

    // buscamos las reservas del evento que no estén borradas
    const bookings = await this.bookingRepository.find({
      where: { event: { id: eventId } },
      relations: ['event'],
    });
    const activeBookings = bookings.filter((b) => b.status !== 'deleted');

    /* logs temporales
    // console.log('Bookings encontrados:', bookings.length);
    // console.log('Activas:', activeBookings.length); */

    // si no hay reservas activas, no hay nada que agrupar
    if (activeBookings.length === 0)
      return {
        groups: [],
        available_guides: [],
        message: 'No hay reservas activas para este evento',
      };

    // buscamos los guías disponibles para este evento
    const availableGuides = await this.getAvailableGuidesForEvent(eventId);

    // capacidad máxima entre los guías disponibles para determinar el tamaño de grupo
    const maxCapacity =
      availableGuides.length > 0
        ? Math.max(...availableGuides.map((g) => g.capacity))
        : 0;

    // si no hay guías disponibles, agrupamos todo en un solo grupo con needs_attention
    if (maxCapacity === 0) {
      return {
        groups: [
          {
            bookings: activeBookings,
            totalPax: activeBookings.reduce((sum, b) => sum + b.pax, 0),
            needs_attention: true,
          },
        ],
        available_guides: [],
        message:
          'No hay guías disponibles para este evento. Revisión manual necesaria.',
      };
    }

    // ordenamos las reservas de mayor a menor pax para optimizar el llenado
    const sortedBookings = [...activeBookings].sort((a, b) => b.pax - a.pax);

    // preparamos la lista de grupos propuestos
    const proposedGroups: {
      bookings: Booking[];
      totalPax: number;
      needs_attention: boolean;
    }[] = [];

    // inicializamos el primer grupo
    let currentGroup: {
      bookings: Booking[];
      totalPax: number;
      needs_attention: boolean;
    } = { bookings: [], totalPax: 0, needs_attention: false };

    // asignamos cada reserva al grupo actual o creamos uno nuevo si no cabe
    for (const booking of sortedBookings) {
      if (currentGroup.totalPax + booking.pax > maxCapacity) {
        // si el grupo actual tiene reservas, lo guardamos y creamos uno nuevo
        if (currentGroup.bookings.length > 0) {
          proposedGroups.push(currentGroup);
        }
        currentGroup = {
          bookings: [booking],
          totalPax: booking.pax,
          // needs_attention si la reserva sola ya supera la capacidad máxima
          needs_attention: booking.pax > maxCapacity,
        };
      } else {
        currentGroup.bookings.push(booking);
        currentGroup.totalPax += booking.pax;
      }
    }

    // añadimos el último grupo
    if (currentGroup.bookings.length > 0) {
      proposedGroups.push(currentGroup);
    }

    /* logs temporales
    console.log('Guías disponibles:', availableGuides.length);
    console.log('Capacidad máxima:', maxCapacity);
    console.log('Grupos propuestos:', proposedGroups.length); */

    return {
      groups: proposedGroups,
      available_guides: availableGuides,
      message: proposedGroups.some((g) => g.needs_attention)
        ? 'Algunos grupos necesitan atención del administrador'
        : 'Grupos generados correctamente',
    };
  }

  // método para confirmar y guardar los grupos propuestos por el algoritmo
  async confirmGroups(dto: ConfirmGroupsDto): Promise<Group[]> {
    const savedGroups: Group[] = [];

    for (const groupData of dto.groups) {
      let group: Group;

      if (groupData.group_id) {
        // si viene user_id, verificamos que es guía y está disponible
        if (groupData.user_id) {
          await this.validateGuideForGroup(
            groupData.group_id,
            groupData.user_id,
          );
          // y que no tenga ya un grupo para este evento
          const groupForEvent = await this.groupRepository.findOne({
            where: { id: groupData.group_id },
            relations: ['event', 'event.service'],
          });
          if (groupForEvent) {
            await this.validateGuideNotDuplicatedInEvent(
              groupForEvent.event.id,
              groupData.user_id,
              groupData.group_id,
            );
          }

          // obtenemos la capacidad del guía para este servicio
          const guideService = groupForEvent
            ? await this.guideServiceRepository.findOne({
                where: {
                  user: { id: groupData.user_id },
                  service: { id: groupForEvent.event.service.id },
                },
              })
            : null;
          // actualizamos el grupo existente con guía y capacidad
          await this.groupRepository.update(groupData.group_id, {
            user: { id: groupData.user_id },
            capacity: guideService?.capacity ?? null,
            // actualizamos confirmed si viene en el DTO
            ...(groupData.confirmed !== undefined && {
              confirmed: groupData.confirmed,
            }),
          });
        } else {
          // no viene user_id — solo actualizamos confirmed si viene
          // pero antes verificamos que no se intente confirmar sin guía asignado
          if (groupData.confirmed === true) {
            const groupToConfirm = await this.groupRepository.findOne({
              where: { id: groupData.group_id },
              relations: ['user'],
            });
            if (!groupToConfirm?.user) {
              throw new BadRequestException(
                'No se puede confirmar un grupo sin guía asignado',
              );
            }
          }
          await this.groupRepository.update(groupData.group_id, {
            ...(groupData.confirmed !== undefined && {
              confirmed: groupData.confirmed,
            }),
          });
        }

        group = (await this.groupRepository.findOne({
          where: { id: groupData.group_id },
        })) as Group;
      } else {
        // si no viene group_id, creamos un grupo nuevo

        // obtenemos la capacidad del guía para este servicio si viene user_id
        let capacity: number | null = null;
        if (groupData.user_id) {
          const event = await this.eventsService.findOne(dto.event_id);
          if (event) {
            const guideService = await this.guideServiceRepository.findOne({
              where: {
                user: { id: groupData.user_id },
                service: { id: event.service.id },
              },
            });
            capacity = guideService?.capacity ?? null;
          }
        }

        group = await this.groupRepository.save({
          event: { id: dto.event_id },
          user: groupData.user_id ? { id: groupData.user_id } : null,
          confirmed: false,
          needs_attention: groupData.needs_attention ?? false,
          capacity,
        });
      }

      // asignamos las reservas al grupo
      for (const bookingId of groupData.booking_ids) {
        await this.bookingRepository.update(bookingId, {
          group: { id: group.id },
        });
      }

      savedGroups.push(group);
    }

    return savedGroups;
  }

  // método para asignar o cambiar el guía de un grupo
  async assignGuide(
    groupId: number,
    userId: number | null,
    manualCapacity?: number,
  ): Promise<Group> {
    // buscamos el grupo con su evento
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['event', 'event.service'],
    });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    // verificamos disponibilidad y rol, y que el guía no tenga ya otro grupo en este evento
    if (userId) {
      await this.validateGuideForGroup(groupId, userId);
      await this.validateGuideNotDuplicatedInEvent(
        group.event.id,
        userId,
        groupId,
      );
    }

    // calculamos la capacidad (manual, si viene, o la del guía configurada para ese servicio)
    let capacity: number | null = manualCapacity ?? null;
    if (!manualCapacity && userId) {
      const guideService = await this.guideServiceRepository.findOne({
        where: {
          user: { id: userId },
          service: { id: group.event.service.id },
        },
      });
      capacity = guideService?.capacity ?? null;
    }

    await this.groupRepository.update(groupId, {
      user: userId ? { id: userId } : null,
      capacity,
      // si viene capacidad manual limpiamos needs_attention
      ...(manualCapacity !== undefined && { needs_attention: false }),
    });

    return (await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['user', 'event'],
    })) as Group;
  }

  // método para mover una reserva de un grupo a otro o desasignarla
  async assignBookingToGroup(
    bookingId: number,
    targetGroupId: number | null,
  ): Promise<void> {
    // buscamos la reserva
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['event', 'group'],
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');

    // si targetGroupId es null, desasignamos la reserva de su grupo actual
    if (targetGroupId === null) {
      await this.bookingRepository.update(bookingId, { group: null });
      return;
    }

    // buscamos el grupo destino
    const targetGroup = await this.groupRepository.findOne({
      where: { id: targetGroupId },
      relations: ['event'],
    });
    if (!targetGroup)
      throw new NotFoundException('Grupo destino no encontrado');

    // verificamos que el grupo destino es del mismo evento
    if (booking.event.id !== targetGroup.event.id) {
      throw new BadRequestException(
        'Este grupo es para un evento distinto al de esta reserva',
      );
    }

    // movemos la reserva al grupo destino
    await this.bookingRepository.update(bookingId, {
      group: { id: targetGroupId },
    });
  }

  // método para recuperar los grupos de un evento específico
  async findByEvent(eventId: number): Promise<Group[]> {
    return await this.groupRepository.find({
      where: { event: { id: eventId } },
      relations: ['user', 'event'],
    });
  }

  // método para borrar grupos no confirmados de un evento
  // si viene groupId borra solo ese grupo, si no borra todos los no confirmados del evento
  async deleteGroups(eventId: number, groupId?: number): Promise<void> {
    if (groupId) {
      // borramos un grupo específico
      const group = await this.groupRepository.findOne({
        where: { id: groupId, event: { id: eventId } },
      });
      if (!group) throw new NotFoundException('Grupo no encontrado');
      if (group.confirmed) {
        throw new BadRequestException(
          'El grupo está confirmado. Desmárcalo primero para poder borrarlo',
        );
      }
      await this.bookingRepository.update(
        { group: { id: groupId } },
        { group: null },
      );
      await this.groupRepository.delete(groupId);
    } else {
      // borramos todos los grupos no confirmados del evento
      const unconfirmedGroups = await this.groupRepository.find({
        where: { event: { id: eventId }, confirmed: false },
      });
      for (const group of unconfirmedGroups) {
        await this.bookingRepository.update(
          { group: { id: group.id } },
          { group: null },
        );
        await this.groupRepository.delete(group.id);
      }
    }
  }

  // método para obtener los guías disponibles para un evento
  async findAvailableGuidesForEvent(eventId: number) {
    return this.getAvailableGuidesForEvent(eventId);
  }

  // método para buscar los grupos por guía
  async findByGuide(
    guideId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<object> {
    // contamos el total de grupos del guía
    const total = await this.groupRepository.count({
      where: { user: { id: guideId } },
    });

    // obtenemos los grupos con sus relaciones ordenados por fecha del evento
    const groups = await this.groupRepository.find({
      where: { user: { id: guideId } },
      relations: ['event', 'event.service'],
      order: { event: { event_time: 'DESC' } },
      skip: (page - 1) * limit,
      take: limit,
    });

    // para cada grupo calculamos el pax total de sus reservas activas
    const data = await Promise.all(
      groups.map(async (group) => {
        // reservas activas del grupo
        const bookings = await this.bookingRepository.find({
          where: { group: { id: group.id } },
        });
        const activeBookings = bookings.filter((b) => b.status !== 'deleted');
        const totalPax = activeBookings.reduce((sum, b) => sum + b.pax, 0);

        return {
          group_id: group.id,
          confirmed: group.confirmed,
          needs_attention: group.needs_attention,
          event_id: group.event.id,
          event_time: group.event.event_time,
          service_name: group.event.service.name,
          service_timezone: group.event.service.timezone,
          capacity: group.capacity,
          total_pax: totalPax,
          booking_count: activeBookings.length,
        };
      }),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // HELPERS

  // método auxiliar para obtener los guías disponibles para un evento
  private async getAvailableGuidesForEvent(eventId: number) {
    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException('Evento no encontrado');

    const eventTime = Number(event.event_time);
    const eventEndTime = eventTime + Number(event.duration) * 60;

    return this.guideAvailabilityService.findAvailableGuidesForEvent(
      event.service.id,
      eventTime,
      eventEndTime,
    );
  }

  // método auxiliar para verificar que un guía no tiene ya un grupo asignado en el mismo evento
  private async validateGuideNotDuplicatedInEvent(
    eventId: number,
    guideId: number,
    excludeGroupId?: number,
  ): Promise<void> {
    const query = this.groupRepository
      .createQueryBuilder('g')
      .where('g.event_id = :eventId', { eventId })
      .andWhere('g.user_id = :guideId', { guideId });

    if (excludeGroupId) {
      query.andWhere('g.id != :excludeGroupId', { excludeGroupId });
    }

    const existing = await query.getOne();
    if (existing) {
      throw new BadRequestException(
        'Este guía ya tiene un grupo asignado en este evento',
      );
    }
  }

  // método auxiliar para verificar que un usuario es guía y está disponible para un evento
  private async validateGuideForGroup(
    groupId: number,
    userId: number,
  ): Promise<void> {
    // verificamos que el usuario tiene rol de guía
    const guide = await this.groupRepository.manager.findOne(User, {
      where: { id: userId, role: UserRole.GUIDE },
    });
    if (!guide) throw new BadRequestException('El usuario no es un guía');

    // buscamos el grupo con su evento
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['event', 'event.service'],
    });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    // verificamos disponibilidad del guía para ese evento
    const eventTime = Number(group.event.event_time);
    const eventEndTime = eventTime + Number(group.event.duration) * 60;
    const availableGuides =
      await this.guideAvailabilityService.findAvailableGuidesForEvent(
        group.event.service.id,
        eventTime,
        eventEndTime,
      );

    const isAvailable = availableGuides.some((g) => g.guide_id === userId);
    if (!isAvailable)
      throw new BadRequestException(
        'El guía no está disponible para este evento',
      );
  }

  // método para obtener las reservas de un grupo específico (con info del grupo y evento)
  async findBookingsByGroup(groupId: number): Promise<object> {
    // buscamos el grupo con su evento y usuario
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['event', 'event.service', 'user'],
    });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const bookings = await this.bookingRepository.find({
      where: { group: { id: groupId } },
    });
    const activeBookings = bookings.filter((b) => b.status !== 'deleted');

    return {
      group_id: group.id,
      confirmed: group.confirmed,
      event_time: group.event.event_time,
      service_name: group.event.service.name,
      service_timezone: group.event.service.timezone,
      guide_name: group.user?.name ?? null,
      capacity: group.capacity,
      total_pax: activeBookings.reduce((sum, b) => sum + b.pax, 0),
      bookings: activeBookings,
    };
  }
}
