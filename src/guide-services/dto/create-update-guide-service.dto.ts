// Decoradores de validación de class-validator
import { IsInt, Min } from 'class-validator';

// Creamos un DTO para validar todos los datos necesarios en la creación o actualización de un nuevo servicio

export class CreateUpdateGuideServiceDto {
  @IsInt()
  @Min(1, { message: 'El ID de usuario no es válido' })
  user_id!: number;

  @IsInt()
  @Min(1, { message: 'El ID de servicio no es válido' })
  service_id!: number;

  @IsInt()
  @Min(1, { message: 'La capacidad debe ser del mín. 1 PAX' })
  capacity!: number;
}
