/* eslint-disable prettier/prettier */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from "express";
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger=new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response=ctx.getResponse<Response>()
    const request=ctx.getRequest<Request>()
    const status = exception.getStatus()

    this.logger.log(HttpExceptionFilter.name)
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path:request.url
      
  })

  }

}
