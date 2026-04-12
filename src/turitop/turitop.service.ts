import { Injectable } from '@nestjs/common';
// importamos módulo para hacer las solicitudes a la API de TuriTop
import { HttpService } from '@nestjs/axios';
// módulo para leer las variables de .env
import { ConfigService } from '@nestjs/config';
// módulo para convertir la respuesta del HttpService
// de un Observable a un Promise que podemos usar con await
import { firstValueFrom } from 'rxjs';
// importamos las interfaces para la llamada getproducts
import {
  TuriTopProduct,
  TuriTopProductsResponse,
} from './interfaces/turitop-product.interface';

@Injectable()
export class TuritopService {
  // recuperamos la API URL y Key de TuriTop
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly language: string;

  constructor(
    // cargamos el servicio para hacer llamadas HTTP a la API de TuriTop
    private readonly httpService: HttpService,
    // y el servicio para leer las credenciales del .env
    configService: ConfigService,
  ) {
    // guardamos las credenciales como propiedades privadas de la clase
    this.apiUrl = configService.get<string>('TURITOP_API_URL')!;
    this.apiKey = configService.get<string>('TURITOP_API_KEY')!;
    this.language = configService.get<string>('TURITOP_LANGUAGE', 'es');
  }

  // obtiene todos los productos de TuriTop y devuelve solo los tours propios
  async getProducts(): Promise<TuriTopProduct[]> {
    const response = await firstValueFrom(
      this.httpService.post<TuriTopProductsResponse>(
        `${this.apiUrl}/product/getproducts`,
        {
          data: {
            language_code: this.language,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    // filtramos los productos que no son propios (reventas) y los que no son tipo tours
    return response.data.data.products.filter(
      (p) => !p.supplier_company_short_id && p.flow === 'tour',
    );
  }
}
