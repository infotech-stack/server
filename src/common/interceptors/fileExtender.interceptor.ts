import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class FileExtender implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    
    if (!req.files) {
      req.files = [];
    }

    req.body.projectName = req.body.projectName || '';
    req.body.startDate = req.body.startDate || '';
    req.body.endDate = req.body.endDate || '';
    req.body.projectStatus = req.body.projectStatus || '';
    req.body.taskName = req.body.taskName || '';
    req.body.assignTo = req.body.assignTo || '';

    return next.handle();
  }
}