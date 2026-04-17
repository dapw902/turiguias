// decorador que permite adjuntar metadatos personalizados a los endpoints
import { SetMetadata } from '@nestjs/common';

// clave para marcar endpoints como públicos (sin autenticación)
export const IS_PUBLIC_KEY = 'isPublic';

// decorador para marcar un endpoint como público
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
