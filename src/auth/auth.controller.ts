// decoradores de NestJS para definir la ruta y el método HTTP
import { Controller, Post, Body, Patch, Req, UseGuards } from '@nestjs/common';
// importamos la clase AuthService: servicio de autenticación con la lógica del login
import { AuthService } from './auth.service';
// y el DTO para validar los datos del login
import { LoginDto } from './dto/login.dto';
// importamos el dto para cambio de contraseñas
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
// JwtAuthGuard: nuestro guard que verifica el token JWT
import { JwtAuthGuard } from './jwt-auth.guard';
// para tipar el objeto request con el payload del JWT
import { Request } from 'express';

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
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // endpoint para cambiar la contraseña (requiere estar autenticado)
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: JwtRequest,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }
}
