import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

// pipe personalizado que convierte un string a número,
// si el valor es "0", devuelve null
@Injectable()
export class ParseNullableIntPipe implements PipeTransform {
  transform(value: string): number | null {
    if (value === '0') return null;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new BadRequestException(`"${value}" no es un número válido`);
    }
    return parsed;
  }
}
