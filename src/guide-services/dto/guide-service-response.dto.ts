// DTO que define los campos que devolvemos al frontend
export class GuideServiceByUserResponseDto {
  guide_name!: string;
  services!: {
    id: number;
    service_name: string;
    capacity: number;
  }[];
}
