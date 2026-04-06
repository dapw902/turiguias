import { Injectable } from '@nestjs/common';
// Importamos la entidad users y también:
// InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    // inyectamos el repositorio de la entidad "User" que nos permitirá hacer
    // las operaciones (sql automáticamente generado) con la base de datos
    // sólo se puede usar dentro de esta clase y no se puede reasignar
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
