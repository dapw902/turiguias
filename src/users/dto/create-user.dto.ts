// Decoradores de validación de class-validator
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Importamos UserRole para validar que el rol sea un valor válido
import { UserRole } from '../user.entity';

// Creamos un DTO para validar todos los datos necesarios en la creación de un nuevo usuario

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
