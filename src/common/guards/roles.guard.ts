// Injectable - para que NestJS pueda inyectar este guard
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// importamos esta clase para leer los metadatos que adjuntamos con el decorador @Roles
import { Reflector } from '@nestjs/core';
// importamos la clave y el enum de roles
import { ROLES_KEY } from '../decorators/roles.decorator';
// importamos la entidad User
import { UserRole } from '../../users/user.entity';

// interfaz para tipar el usuario del request
interface RequestUser {
  id: number;
  email: string;
  role: UserRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // obtenemos los roles requeridos del endpoint
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // si el endpoint no tiene roles definidos, permitimos el acceso
    if (!requiredRoles) return true;

    // obtenemos el usuario del request (viene del JWT)
    const { user } = context.switchToHttp().getRequest<{ user: RequestUser }>();

    /* logs temporales
    console.log('User role:', user?.role);
    console.log('Required roles:', requiredRoles);
    console.log('User object:', user);*/

    // si no hay usuario autenticado, denegamos el acceso
    if (!user) return false;

    // verificamos que el rol del usuario está entre los roles requeridos
    return requiredRoles.includes(user.role);
  }
}
