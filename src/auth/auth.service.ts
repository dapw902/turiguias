import { Injectable, UnauthorizedException } from '@nestjs/common';
// JWT para validación del token de sesión
import { JwtService } from '@nestjs/jwt';
// importamos el módulo de usuarios
import { UsersService } from '../users/users.service';
// para lectura de la contraseña encriptada
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    // inyectamos UsersService para buscar usuarios en la BBDD durante el login
    private readonly usersService: UsersService,
    // inyectamos JwtService para generar el token JWT cuando el login es correcto
    private readonly jwtService: JwtService,
  ) {}

  // método para validar el login de un usuario
  async login(email: string, password: string) {
    // buscamos el usuario por email
    const user = await this.usersService.findByEmail(email);

    // si no existe el usuario, lanzamos un error
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // comparamos la contraseña introducida con la hasheada en la BBDD
    const passwordMatch = await bcrypt.compare(password, user.password);

    // si no coincide, lanzamos el mismo error genérico
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // si todo es correcto, guardamos los datos del usuario y generamos el token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
