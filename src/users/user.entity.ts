// Importamos varios decoradores necesarios para crear la entidad
/* Entity - para indicar al TypeORM que esta clase representa una tabla en la BBDD
 PrimaryGeneratedColumn - para marcar la columna que es la clave primaria
 Column - para indicar el resto de columnas */

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// declaramos los roles posibles
export enum UserRole {
  ADMIN = 'admin',
  GUIDE = 'guide',
}

// vinculamos a la tabla "users" de la BBDD
@Entity('users')
// creamos la clase User
export class User {
  // marca id como clave primaria que se genera automáticamente
  @PrimaryGeneratedColumn()
  id!: number;
  // cargamos las demás columnas
  @Column({ length: 100 })
  name!: string;

  // verifica que el email no se repita
  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ length: 255, select: false })
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.GUIDE })
  role!: UserRole;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ default: false, select: false })
  must_change_password!: boolean;
}
