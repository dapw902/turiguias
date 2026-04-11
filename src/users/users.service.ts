import { Injectable } from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos la entidad User
import { User } from './user.entity';
// el DTO para crear nuevos usuarios
import { CreateUserDto } from './dto/create-user.dto';
// el DTO para actualizar usuarios existentes
import { UpdateUserDto } from './dto/update-user.dto';
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
      // y sobreescribir la contraseña hasheada
      password: hashedPassword,
    });
    // hacermos un INSERT en la BBDD para registrar al usuario
    const savedUser = await this.usersRepository.save(user);
    // desestructuramos el objeto savedUser para excluir la contraseña de la respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    return result;
  }

  // método para actualizar usuarios existentes
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    // si se manda nueva contraseña, se hashea antes de guardala
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    // guardamos en la BBDD con un UPDATE
    await this.usersRepository.update(id, updateUserDto);
    // recuperamos los datos del usuario que se ha cambiado
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    // desestructuramos el objeto updatedUser para excluir la contraseña de la respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser!;
    return result;
  }

  // método para buscar a un usuario por su email y verificar su contraseña
  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      // necesitamos la contraseña para verificarla durante el login
      select: [
        'id',
        'name',
        'email',
        'password',
        'role',
        'must_change_password',
      ],
    });
  }
}
