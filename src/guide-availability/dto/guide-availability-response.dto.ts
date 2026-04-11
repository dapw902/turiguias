// DTO que define los campos que devolvemos al frontend
export class GuideAvailabilityByUserResponseDto {
  guide_id!: number;
  guide_name!: string;
  availabilities!: {
    id: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
  }[];
}
