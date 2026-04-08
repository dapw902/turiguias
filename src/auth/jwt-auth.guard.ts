// importamos Injectable para que NestJS pueda inyectar este guard
import { Injectable } from '@nestjs/common';
// AuthGuard es la clase base de Passport para crear guards de autenticación
import { AuthGuard } from '@nestjs/passport';

// guard que protege los endpoints verificando el token JWT
// 'jwt' indica que usa la estrategia JWT que definimos en jwt.strategy.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
