import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { v1 as uuid } from 'uuid';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { addDays } from 'date-fns';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
        private jwtService: JwtService
    ) {}

    async createUser(authCredentialDto: AuthCredentialDto): Promise<void> {
        const { username } = authCredentialDto;

        if (!username) {
            throw new ConflictException('Username is required for registration.');
        }

        return this.userRepository.createUser(authCredentialDto);
    }

    async validateUser(authCredentialDto: AuthCredentialDto): Promise<User> {
        const { email, password } = authCredentialDto;
        const user = await this.userRepository.getUserByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) { return user; }
        else { return null; }
    }

    async logIn(user: User): Promise<{ accessToken: string, refreshToken: string }> {
            const payload = {
                id: user.id,
                email: user.email,
                username: user.username
            };
            const accessToken = await this.jwtService.sign(payload);
            let refreshToken = user.refreshToken;
            if (!refreshToken) {
                refreshToken = uuid();
                const refreshTokenExpiresAt = addDays(new Date(), 14);
                await this.userRepository.saveRefreshToken(user.id, refreshToken, refreshTokenExpiresAt);
            }

            return { accessToken, refreshToken };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string, refreshToken: string }> {
        const { refreshToken } = refreshTokenDto;
        const user = await this.userRepository.getUserByRefreshToken(refreshToken);

        if (user.refreshTokenExpiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username
        };

        const accessToken = await this.jwtService.sign(payload);
        const newRefreshToken = uuid();
        const newRefreshTokenExpiresAt = addDays(new Date(), 14);

        await this.userRepository.saveRefreshToken(user.id, newRefreshToken, newRefreshTokenExpiresAt);

        return { accessToken, refreshToken: newRefreshToken };
    }
}
