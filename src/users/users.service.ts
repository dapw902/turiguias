import { Injectable, BadRequestException } from '@nestjs/common';
// Importamos InjectRepository - decorador para inyectar el repositorio de una entidad concreta
import { InjectRepository } from '@nestjs/typeorm';
// Repository - clase de TypeORM para tener acceso a los métodos de consulta
import { Repository } from 'typeorm';
// importamos las entidades User y UserRole
import { User, UserRole } from './user.entity';
// el DTO para crear nuevos usuarios
import { CreateUserDto } from './dto/create-user.dto';
// el DTO para actualizar usuarios existentes
import { UpdateUserDto } from './dto/update-user.dto';
// importamos todo el módulo de bcrypt para la encriptación de contraseñas
import * as bcrypt from 'bcrypt';
// importamos el dto que da formato a las respuestas
import { UserResponseDto } from './dto/user-response.dto';
// dto para la paginación de resultados
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
// importamos la entidad Group
import { Group } from '../groups/group.entity';

@Injectable()
export class UsersService {
  constructor(
    // inyectamos el repositorio de la entidad "User" que nos permitirá hacer
    // las operaciones (sql automáticamente generado) con la base de datos
    // sólo se puede usar dentro de esta clase y no se puede reasignar
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    // para actualizar los grupos cuando se borren users
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  // método para obtener el listado entero de usuarios con paginación
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    // contamos el total de usuarios
    const total = await this.usersRepository.count();

    // obtenemos los usuarios de la página solicitada
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users.map((u) => UserResponseDto.fromEntity(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // método para recuperar un usuario específico
  async findOne(id: number): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    return UserResponseDto.fromEntity(user);
  }

  // método para borrar a un usuario
  async remove(id: number): Promise<void> {
    // verificamos que no sea el último admin
    const admins = await this.usersRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const userToDelete = await this.usersRepository.findOne({ where: { id } });

    if (userToDelete?.role === UserRole.ADMIN && admins === 1) {
      throw new BadRequestException(
        'No se puede eliminar el último administrador',
      );
    }

    // si el usuario es guía, desconfirmamos y marcamos como needs_attention sus grupos
    await this.groupRepository.update(
      { user: { id } },
      { confirmed: false, needs_attention: true },
    );

    await this.usersRepository.delete(id);
  }

  // método para borrar la cuenta del usuario logueado
  async deleteSelf(id: number): Promise<void> {
    await this.remove(id);
  }

  // método para crear nuevos usuarios
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
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
    return UserResponseDto.fromEntity(savedUser);
  }

  // método para actualizar usuarios existentes
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // si se manda nueva contraseña, se hashea antes de guardala
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    // guardamos en la BBDD con un UPDATE
    await this.usersRepository.update(id, updateUserDto);
    // recuperamos los datos del usuario que se ha cambiado
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    return UserResponseDto.fromEntity(updatedUser!);
  }

  // método interno para buscar a un usuario por su email y verificar su contraseña
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

  // método interno para actualizar la contraseña de un usuario
  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(id, {
      password: hashedPassword,
      must_change_password: false,
    });
  }

  // método interno para buscar las credenciales de un usuario por id
  async findCredentialsById(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'password', 'role', 'must_change_password'],
    });
  }

  // método para actualizar la foto de perfil de un usuario
  async updatePhoto(id: number, photoPath: string): Promise<UserResponseDto> {
    await this.usersRepository.update(id, { photo: photoPath });
    const user = await this.usersRepository.findOne({ where: { id } });
    return UserResponseDto.fromEntity(user!);
  }
}
