// decorador que permite adjuntar metadatos personalizados a los endpoints
import { SetMetadata } from '@nestjs/common';
// importamos el enum UserRole para tipar los roles válidos
import { UserRole } from '../../users/user.entity';

// clave para almacenar los roles en los metadatos del endpoint
export const ROLES_KEY = 'roles';

// decorador para indicar qué roles pueden acceder a un endpoint
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
