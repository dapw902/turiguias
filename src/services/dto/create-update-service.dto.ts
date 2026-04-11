// Decoradores de validación de class-validator
import { IsString, IsInt, Min } from 'class-validator';

// Creamos un DTO para validar todos los datos necesarios en la creación o actualización de un nuevo servicio

export class CreateUpdateServiceDto {
  @IsString()
  turitop_product_id!: string;

  @IsString()
  name!: string;

  @IsInt({ message: 'La duración se expresa en números enteros en minutos' })
  @Min(0, { message: 'La duración no puede ser negativa' })
  duration!: number;
}
