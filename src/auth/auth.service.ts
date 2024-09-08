import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';

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

    async logIn(authCredentialDto: AuthCredentialDto): Promise<{ accessToken: string }> {
        const { email, password } = authCredentialDto;
        const user = await this.userRepository.getUserByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload = {
                id: user.id,
                email,
                username: user.username
            };
            const accessToken = await this.jwtService.sign(payload);

            return { accessToken };
        } else {
            throw new UnauthorizedException('Login failed');
        }
    }
}
