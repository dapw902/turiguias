// Importamos varios decoradores necesarios para crear la entidad y las relaciones
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// importamos los módulos de User y Services
import { User } from '../users/user.entity';

// vinculamos a la tabla "guide_availability" de la BBDD
@Entity('guide_availability')
// creamos la clase GuideService
export class GuideAvailability {
  // marca id como clave primaria que se genera automáticamente
  @PrimaryGeneratedColumn()
  id!: number;
  // cargamos las demás columnas y marcamos la relaciones many to one
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'date' })
  start_date!: string;

  @Column({ type: 'date' })
  end_date!: string;

  @Column({ type: 'date' })
  start_time!: string;

  @Column({ type: 'date' })
  end_time!: string;
}
