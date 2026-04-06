import { Injectable } from '@nestjs/common';
// Importamos la entidad users y también:
// InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
import { User } from './user.entity';
// el DTO para crear nuevos usuarios
import { CreateUserDto } from './dto/create-user.dto';
// importamos todo el módulo de bcrypt para la encriptación de contraseñas
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    // inyectamos el repositorio de la entidad "User" que nos permitirá hacer
    // las operaciones (sql automáticamente generado) con la base de datos
    // sólo se puede usar dentro de esta clase y no se puede reasignar
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // método para obtener el listado entero de usuarios
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  // método para recuperar un usuario específico
  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  // método para borrar a un usuario
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // método para crear nuevos usuarios
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // encriptación de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    // creamos un usuario validando los datos con el DTO
    const user = this.usersRepository.create({
      //spread operator - para copiar más rápido: name, email, password, etc
      ...createUserDto,
      password: hashedPassword,
    });
    // hacermos un insert en la BBDD para registrar al usuario
    const savedUser = await this.usersRepository.save(user);
    // desestructuramos el objeto savedUser para excluir la contraseña de la respuesta
    const { password, ...result } = savedUser;
    return result;
  }
}
