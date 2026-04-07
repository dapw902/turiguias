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

// Creamos un DTO para validar todos los datos al actualizar un usuario existente

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Introduce un email válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  // Validación adicional - para ACTIVAR en producción
  // @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/, {
  //   message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial'
  // })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Valores admitidos: admin o guide' })
  role?: UserRole;

  @IsOptional()
  @Matches(/^\+?[0-9\s-]{7,15}$/, {
    message: 'Introduce un teléfono válido',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
