// decorador para que NestJS pueda inyectar esta clase
import { Injectable } from '@nestjs/common';
// clase base de Passport que nos permite definir estrategias de autenticación
import { PassportStrategy } from '@nestjs/passport';
// ExtractJwt: indica dónde buscar el token en la petición (en el header Authorization)
// Strategy: la estrategia JWT de passport-jwt que verifica y decodifica el token
import { ExtractJwt, Strategy } from 'passport-jwt';
// para leer el JWT_SECRET del .env
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // extrae el token del header Authorization (bearer token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // si el token ha expirado, rechaza la petición
      ignoreExpiration: false,
      // consulta el secret key del servidor para verificar la firma del token
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }
  // método para transformar el payload en un objeto usuario
  validate(payload: { sub: number; email: string; role: string }) {
    // se adjunta a cada petición como req.user
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
