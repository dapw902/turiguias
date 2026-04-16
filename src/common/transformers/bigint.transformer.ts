// transformer para convertir columnas BIGINT de MariaDB a número
// MariaDB devuelve BIGINT como string, este transformer lo convierte a number
export const BigIntTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};
