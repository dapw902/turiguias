// Decoradores de validación de class-validator
import { IsInt, Min, IsDateString, Matches } from 'class-validator';

// Creamos un DTO para validar todos los datos necesarios en la creación o actualización de un nuevo servicio

export class CreateGuideAvailabilityDto {
  @IsInt()
  @Min(1, { message: 'El ID de usuario no es válido' })
  user_id!: number;

  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  start_date!: string;

  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  end_date!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora debe tener formato HH:MM',
  })
  start_time!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora debe tener formato HH:MM',
  })
  end_time!: string;
  static user_id: any;
}
