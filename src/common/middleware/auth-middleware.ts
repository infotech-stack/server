/* eslint-disable prettier/prettier */
import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
private readonly logger=new Logger(AuthMiddleware.name);
  use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers
    this.logger.log('AuthMiddleware')
    if (!authorization) throw new UnauthorizedException()
    
    next()
  }
}
