// DTO que define los campos que devolvemos al frontend
export class GuideServiceByUserResponseDto {
  guide_id!: number;
  guide_name!: string;
  services!: {
    id: number;
    service_name: string;
    timezone: string;
    capacity: number;
  }[];
}
