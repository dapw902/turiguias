// Decoradores de validación de class-validator
import { IsEmail, IsString } from 'class-validator';

// Creamos un DTO para validar los datos en el login

export class LoginDto {
  @IsEmail({}, { message: 'Introduce un email válido' })
  email!: string;

  @IsString()
  password!: string;
}
