import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ default: false })
  confirmed!: boolean;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  needs_attention!: boolean;

  @Column({ nullable: true, default: null })
  capacity!: number | null;
}
