// Importamos varios decoradores necesarios para crear la entidad y las relaciones
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// importamos los módulos de Services
import { Service } from '../services/service.entity';
// transformer para asegurar que el valor venga como number en vez de string
import { BigIntTransformer } from '../common/transformers/bigint.transformer';

// vinculamos a la tabla "events" de la BBDD
@Entity('events')
// creamos la clase Event
export class Event {
  // marca id como clave primaria que se genera automáticamente
  @PrimaryGeneratedColumn()
  id!: number;
  // cargamos las demás columnas
  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service!: Service;

  @Column({ type: 'bigint', transformer: BigIntTransformer })
  event_time!: number;

  @Column({ default: 0 })
  duration!: number;

  @Column({ default: 0 })
  capacity!: number;

  @Column({ default: 'open' })
  status!: string;
}
