// importamos los decoradores necesarios
import { Controller, Post, Body, Headers } from '@nestjs/common';
// importamos el servicio de webhooks
import { WebhooksService } from './webhooks.service';
// marcamos el endpoint como público
import { Public } from '../common/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  // endpoint que recibe las notificaciones de TuriTop
  @Public()
  @Post('turitop')
  handleTuritopWebhook(@Body() payload: Record<string, unknown>) {
    // extraemos el token del payload y lo eliminamos para no interferir
    const token = payload.token as string | undefined;
    delete payload.token;
    // respondemos inmediatamente y procesamos en segundo plano
    setImmediate(() => {
      void this.webhooksService.handleWebhook(payload, token);
    });

    return { received: true };
  }
}
