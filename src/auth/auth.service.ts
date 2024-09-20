import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
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

        if (await bcrypt.compare(password, user.password)) { return user; }
        else { throw new UnauthorizedException('Invalid Credential'); }
    }

    async logIn(user: User): Promise<{ accessToken: string, refreshToken: string }> {
        const accessToken = await this.generateAccessToken(user);

        let refreshToken = user.refreshToken;
        if (!refreshToken) {
            refreshToken = await this.generateRefreshToken(user);
        }

        return { accessToken, refreshToken };
    }

    async generateAccessToken(user: User): Promise<string> {
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };
        
        const accessToken = this.jwtService.sign(payload);
        return accessToken;
    }

    async generateRefreshToken(user: User): Promise<string> {
        const payload = { id: user.id };
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '14d' });
        const refreshTokenExpiresAt = addDays(new Date(), 14);
        await this.userRepository.saveRefreshToken(user.id, refreshToken, refreshTokenExpiresAt);
        return refreshToken;
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
        let userId: number;
    
        try {
            const payload = this.jwtService.verify(refreshToken);
            userId = payload.id;
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    
        const user = await this.userRepository.getUserById(userId);
        if (!user || user.refreshToken !== refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    
        if (user.refreshTokenExpiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }
    
        const accessToken = await this.generateAccessToken(user);
    
        return { accessToken };
    }

    async removeRefreshToken(userId: number): Promise<void> {
        await this.userRepository.update(userId, {refreshToken: null, refreshTokenExpiresAt: null});
    }
}
