import { IsOptional, IsInt, Min, Max } from 'class-validator';
// para la transformación de tipos en los query params
import { Type } from 'class-transformer';

// DTO para la paginación de resultados
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 20;
}
