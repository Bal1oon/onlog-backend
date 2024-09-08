import { JwtModuleOptions } from '@nestjs/jwt';
import * as config from 'config';

const jwtConfig = config.get('jwt');

export const jwtOptions: JwtModuleOptions = {
    secret: jwtConfig.secret,
    signOptions: {
        expiresIn: jwtConfig.expiresIn,
    }
}