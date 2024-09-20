import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';

@Injectable()
export class PostAuthGuard implements CanActivate {
    private logger = new Logger('PostAuthGuard');
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        // const authHeader = request.headers['authorization'];
        const token = request.cookies['accessToken'];

        // if (authHeader) {
        //     const token = authHeader.split(' ')[1];
        if (token) {
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
