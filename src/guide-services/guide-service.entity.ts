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
import { Service } from '../services/service.entity';

// vinculamos a la tabla "guide_services" de la BBDD
@Entity('guide_services')
// creamos la clase GuideService
export class GuideService {
  // marca id como clave primaria que se genera automáticamente
  @PrimaryGeneratedColumn()
  id!: number;
  // cargamos las demás columnas y marcamos la relaciones many to one
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service!: Service;

  @Column()
  capacity!: number;
}
