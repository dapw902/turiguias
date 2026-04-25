// Decoradores de validación de class-validator
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

// Importamos UserRole para validar que el rol sea un valor válido
import { UserRole } from '../user.entity';

// Creamos un DTO para validar todos los datos necesarios en la creación de un nuevo usuario

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail({}, { message: 'Introduce un email válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  // Validación adicional - para ACTIVAR en producción
  // @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/, {
  //   message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial'
  // })
  password!: string;

  @IsEnum(UserRole, { message: 'Valores admitidos: admin o guide' })
  role!: UserRole;

  @IsOptional()
  @Matches(/^\+?[0-9\s-]{7,15}$/, {
    message: 'Introduce un teléfono válido',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
