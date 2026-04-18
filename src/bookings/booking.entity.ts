// Importamos varios decoradores necesarios para crear la entidad y las relaciones
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { Group } from '../groups/group.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  turitop_booking_id!: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @Column({ default: 0 })
  pax!: number;

  @Column({ type: 'json' })
  client_data!: Record<string, string>;

  @Column({ type: 'json' })
  ticket_type_count!: object;

  @Column({ default: 'confirmed' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group!: Group | null;
}
