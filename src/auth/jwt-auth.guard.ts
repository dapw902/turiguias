// importamos Injectable para que NestJS pueda inyectar este guard
import { Injectable, ExecutionContext } from '@nestjs/common';
// AuthGuard es la clase base de Passport para crear guards de autenticación
import { AuthGuard } from '@nestjs/passport';
// para leer los metadatos que adjuntamos con el decorador @Public
import { Reflector } from '@nestjs/core';
// importamos la clave del decorador @Public para identificar endpoints públicos
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

// guard que protege los endpoints verificando el token JWT
// 'jwt' indica que usa la estrategia JWT que definimos en jwt.strategy.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // si el endpoint está marcado como público, permitimos el acceso sin token
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // si no es público, verificamos el token JWT normalmente
    return super.canActivate(context);
  }
}
