// importamos las entidades de User y UserRole
import { User } from '../user.entity';
import { UserRole } from '../user.entity';

// DTO que define los campos que devolvemos al frontend
// excluye password
export class UserResponseDto {
  id!: number;
  name!: string;
  email!: string;
  role!: UserRole;
  phone!: string | null;
  notes!: string | null;
  photo!: string | null;
  must_change_password!: boolean;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    dto.phone = user.phone;
    dto.notes = user.notes;
    dto.photo = user.photo ?? null;
    dto.must_change_password = user.must_change_password;
    return dto;
  }
}
