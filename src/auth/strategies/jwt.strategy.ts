import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepository } from "src/users/user.repository";
import * as config from 'config';
import { User } from "src/users/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) {
        super({
            secretOrKey: config.get('jwt.secret'),
            //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    return request?.cookies?.accessToken;
                }
            ])
        })
    }

    async validate(payload: any) {
        const { id, email, username } = payload;

        const user: User = await this.userRepository.getUserById(id);

        if (!user || user.username !== username || user.email !== email) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }
}