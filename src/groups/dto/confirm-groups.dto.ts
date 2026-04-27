import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';

// DTO para cada grupo individual
export class GroupItemDto {
  @IsOptional()
  @IsNumber()
  group_id?: number; // si viene, actualizamos; si no, creamos

  @IsArray()
  booking_ids!: number[];

  @IsOptional()
  @IsNumber()
  user_id!: number | null;
  @IsOptional()
  confirmed?: boolean;
  @IsOptional()
  needs_attention?: boolean;
}

// DTO para confirmar los grupos propuestos automáticamente
export class ConfirmGroupsDto {
  @IsNumber()
  event_id!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupItemDto)
  groups!: GroupItemDto[];
}
