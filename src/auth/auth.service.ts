import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { v1 as uuid } from 'uuid';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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

    async logIn(authCredentialDto: AuthCredentialDto): Promise<{ accessToken: string, refreshToken: string }> {
        const { email, password } = authCredentialDto;
        const user = await this.userRepository.getUserByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload = {
                id: user.id,
                email,
                username: user.username
            };
            const accessToken = await this.jwtService.sign(payload);
            let refreshToken = user.refreshToken;
            if (!refreshToken) {
                refreshToken = uuid();
                await this.userRepository.saveRefreshToken(user.id, refreshToken);
            }

            return { accessToken, refreshToken };
        } else {
            throw new UnauthorizedException('Login failed');
        }
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
        const { refreshToken } = refreshTokenDto;

        const user = await this.userRepository.getUserByRefreshToken(refreshToken);
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username
        };

        const accessToken = await this.jwtService.sign(payload);
        return { accessToken };
    }
}
