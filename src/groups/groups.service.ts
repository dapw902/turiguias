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
    const eventTime = Number(event.event_time);
    const eventEndTime = eventTime + Number(event.duration) * 60;
    const availableGuides =
      await this.guideAvailabilityService.findAvailableGuidesForEvent(
        event.service.id,
        eventTime,
        eventEndTime,
      );

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
        }

        // si viene group_id, actualizamos el grupo existente
        await this.groupRepository.update(groupData.group_id, {
          user: groupData.user_id ? { id: groupData.user_id } : null,
          // actualizamos confirmed si viene en el DTO
          ...(groupData.confirmed !== undefined && {
            confirmed: groupData.confirmed,
          }),
        });
        group = (await this.groupRepository.findOne({
          where: { id: groupData.group_id },
        })) as Group;
      } else {
        // si no viene group_id, creamos un grupo nuevo y lo registramos en la BBDD
        group = await this.groupRepository.save({
          event: { id: dto.event_id },
          user: groupData.user_id ? { id: groupData.user_id } : null,
          confirmed: false,
          needs_attention: false,
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
  // método para asignar o cambiar el guía de un grupo
  async assignGuide(groupId: number, userId: number | null): Promise<Group> {
    // buscamos el grupo con su evento
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['event', 'event.service'],
    });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    // si se asigna un guía, verificamos su disponibilidad y rol
    if (userId) {
      await this.validateGuideForGroup(groupId, userId);
    }

    await this.groupRepository.update(groupId, {
      user: userId ? { id: userId } : null,
    });

    return (await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['user', 'event'],
    })) as Group;
  }

  // método para mover una reserva de un grupo a otro
  async assignBookingToGroup(
    bookingId: number,
    targetGroupId: number,
  ): Promise<void> {
    // buscamos la reserva
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['event', 'group'],
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');

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

  // HELPERS
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
}
