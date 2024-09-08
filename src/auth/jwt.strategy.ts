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
            secret: config.get('jwt.secret'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate(payload) {
        const { email, username } = payload;
        const user: User = await this.userRepository.getUserByUsername(username);

        if (!user || user.email !== email) {
            throw new UnauthorizedException();
        }

        return user;
    }
}