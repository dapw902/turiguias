// importamos los decoradores necesarios
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// importamos Request y Response de express para tipar los objetos
import { Request, Response } from 'express';

// @Catch() sin argumentos captura todas las excepciones
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // indicamos que estamos en contexto HTTP (no WebSocket)
    const ctx = host.switchToHttp();
    // obtenemos el objeto response para poder enviar la respuesta
    const response = ctx.getResponse<Response>();
    // obtenemos el objeto request para leer la URL
    const request = ctx.getRequest<Request>();

    // si es una HttpException usamos su status (código), si no es un error 500
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // si es una HttpException usamos su mensaje, si no mensaje genérico
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Error interno del servidor';

    // enviamos la respuesta con el formato estándar
    response.status(status).json({
      statusCode: status,
      // si message es un objeto con propiedad "message", la extraemos
      // si es un string, lo usamos directamente. Y pasamos fecha, hora y ruta del error
      message:
        typeof message === 'object' && 'message' in message
          ? (message as { message: string }).message
          : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
