// define la forma de un evento devuelto por la API de TuriTop
export interface TuriTopEvent {
  time: number;
  time_iso8601: string;
  status: string;
  full: boolean;
  code_closed?: string[];
}

// define la forma de la respuesta completa de getevents
export interface TuriTopEventsResponse {
  data: {
    events: TuriTopEvent[];
  };
}
