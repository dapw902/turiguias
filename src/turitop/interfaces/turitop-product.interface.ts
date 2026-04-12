// define la forma de un producto devuelto por la API de TuriTop
export interface TuriTopProduct {
  short_id: string;
  name: string;
  disabled: boolean;
  flow: string;
  duration: string;
  timezone: string;
  supplier_company_short_id?: string;
}

// define la forma de la respuesta completa de getproducts
export interface TuriTopProductsResponse {
  data: {
    products: TuriTopProduct[];
  };
}
