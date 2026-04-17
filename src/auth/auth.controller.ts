// decoradores de NestJS para definir la ruta y el método HTTP
import { Controller, Post, Body, Patch, Req } from '@nestjs/common';
// importamos la clase AuthService: servicio de autenticación con la lógica del login
import { AuthService } from './auth.service';
// y el DTO para validar los datos del login
import { LoginDto } from './dto/login.dto';
// importamos el dto para cambio de contraseñas
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
// para tipar el objeto request con el payload del JWT
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';

// interfaz para tipar el request con el payload del JWT
interface JwtRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // endpoint para validar el login de un usuario
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // endpoint para cambiar la contraseña (requiere estar autenticado)
  @Patch('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: JwtRequest,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }
}
