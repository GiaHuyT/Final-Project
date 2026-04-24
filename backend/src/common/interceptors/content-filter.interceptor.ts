import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { scanObjectForBannedWords } from '../utils/content-filter.util';

@Injectable()
export class ContentFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Only intercept HTTP requests (not websockets, websockets will be handled in gateway)
    if (request && (request.body || request.query)) {
      if (scanObjectForBannedWords(request.body)) {
        throw new BadRequestException('Nội dung chứa từ khóa vi phạm tiêu chuẩn cộng đồng.');
      }
      
      if (scanObjectForBannedWords(request.query)) {
        throw new BadRequestException('Tìm kiếm chứa từ khóa vi phạm tiêu chuẩn cộng đồng.');
      }
    }

    return next.handle();
  }
}
