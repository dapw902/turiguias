// import para usar la interfaz de los productos de TuriTop
import { TuriTopProduct } from '../../turitop/interfaces/turitop-product.interface';
// importamos el decodificador de HTML
import * as he from 'he';

// DTO para transformar un producto de TuriTop al formato de la tabla services
export class SyncServiceDto {
  turitop_product_id!: string;
  name!: string;
  duration!: number;
  timezone!: string;

  // método estático para construir el DTO desde un producto de TuriTop
  static fromTuriTop(product: TuriTopProduct): SyncServiceDto {
    const dto = new SyncServiceDto();
    dto.turitop_product_id = product.short_id;
    dto.name = he.decode(product.name);
    dto.duration = parseInt(product.duration);
    dto.timezone = product.timezone;
    return dto;
  }
}
