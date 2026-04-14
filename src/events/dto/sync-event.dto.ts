// importamos la interfaz para los eventos de TuriTop
import { TuriTopEvent } from '../../turitop/interfaces/turitop-event.interface';

// DTO para transformar un evento de TuriTop al formato de nuestra BBDD
export class SyncEventDto {
  event_time!: number;
  duration!: number;
  status!: string;

  static fromTuriTop(event: TuriTopEvent, duration: number): SyncEventDto {
    const dto = new SyncEventDto();
    dto.event_time = event.time;
    dto.duration = duration;
    dto.status = event.status;
    return dto;
  }
}
