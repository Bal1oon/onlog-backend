import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';

@Injectable()
export class CustomAuthGuard implements CanActivate {
    private logger = new Logger('CustomAuthGuard');
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const user = jwt.verify(token, config.get('jwt.secret'));
                request.user = user;
                return true;
            } catch (err) {
                this.logger.warn(`Invalid Token: ${ err.message }`);
            }
        }

        return true;
    }
}
