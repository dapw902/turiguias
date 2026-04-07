// decoradores de NestJS para definir la ruta y el método HTTP
import { Controller, Post, Body } from '@nestjs/common';
// importamos la clase AuthService: servicio de autenticación con la lógica del login
import { AuthService } from './auth.service';
// y el DTO para validar los datos del login
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // método para validar el login de un usuario
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
