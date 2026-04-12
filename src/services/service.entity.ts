// Importamos varios decoradores necesarios para crear la entidad
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// vinculamos a la tabla "services" de la BBDD
@Entity('services')
// creamos la clase Services
export class Service {
  // marca id como clave primaria que se genera automáticamente
  @PrimaryGeneratedColumn()
  id!: number;
  // cargamos las demás columnas
  @Column({ length: 20, unique: true })
  turitop_product_id!: string;
  @Column({ length: 150 })
  name!: string;
  @Column({ default: 0 })
  duration!: number;
  @Column({ length: 50, default: 'UTC' })
  timezone!: string;
}
