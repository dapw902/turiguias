import { Injectable } from '@nestjs/common';
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

    // logs temporales
    console.log('Bookings encontrados:', bookings.length);
    console.log('Activas:', activeBookings.length);

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
      if (
        maxCapacity === 0 ||
        currentGroup.totalPax + booking.pax > maxCapacity
      ) {
        // si el grupo actual tiene reservas, lo guardamos y creamos uno nuevo
        if (currentGroup.bookings.length > 0) {
          proposedGroups.push(currentGroup);
        }
        currentGroup = {
          bookings: [booking],
          totalPax: booking.pax,
          // needs_attention si la reserva sola ya supera la capacidad máxima
          needs_attention: maxCapacity === 0 || booking.pax > maxCapacity,
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

    // logs temporales
    console.log('Guías disponibles:', availableGuides.length);
    console.log('Capacidad máxima:', maxCapacity);
    console.log('Grupos propuestos:', proposedGroups.length);

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
        // si viene group_id, actualizamos el grupo existente
        await this.groupRepository.update(groupData.group_id, {
          user: groupData.user_id ? { id: groupData.user_id } : null,
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
}
