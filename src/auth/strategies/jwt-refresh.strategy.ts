import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepository } from "src/users/user.repository";
import * as config from 'config';
import { User } from "src/users/user.entity";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) {
        super({
            secretOrKey: config.get('jwt.secret'),
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    return request?.cookies?.refreshToken;
                }
            ])
        })
    }

    async validate(payload: any) {
        const { id } = payload;
        const user: User = await this.userRepository.findOne({ where: { id }, select: { id } });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }
}