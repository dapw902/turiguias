import { IsString, MinLength } from 'class-validator';

// DTO para el cambio de contraseña
export class ChangePasswordDto {
  @IsString()
  current_password!: string;

  @IsString()
  @MinLength(8)
  new_password!: string;
}
