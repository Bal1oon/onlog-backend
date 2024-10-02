import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';
import { User } from 'src/users/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
    private logger = new Logger('AuthService');

    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
        private jwtService: JwtService
    ) {}

    async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
        const { email, username, password, description } = registerUserDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.userRepository.create({
            email,
            username,
            password: hashedPassword,
            description: description ? description.trim() : ''
        });

        try {
            await this.userRepository.save(user);
            this.logger.log(`User ${user.id} is registered successfully.`);
        } catch (error) {
            this.handleRegistrationError(error, email, username);
        }

        return user;
    }

    private handleRegistrationError(error: any, email: string, username: string): void {
        if (error.code === '23505') {
            if (error.detail.includes('Key (email)')) {
                this.logger.warn(`Email ${email} already exists.`);
                throw new ConflictException('Existing Email');
            } else {
                this.logger.warn(`Username ${username} already exists.`);
                throw new ConflictException('Existing Username');
            }
        } else {
            this.logger.error(`Failed to create user: ${error.message}`);
            throw new InternalServerErrorException();
        }
    }

    async validateUser(authCredentialDto: AuthCredentialDto): Promise<User> {
        const { email, password } = authCredentialDto;
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (await bcrypt.compare(password, user.password)) {
            this.logger.log(`User '${email}' validated successfully.`);
            return user;
        } else {
            this.logger.warn(`Invalid credentials for user '${email}'.`);
            throw new UnauthorizedException('Invalid credentials');
        }
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
        await this.userRepository.update(userId, { refreshToken: null, refreshTokenExpiresAt: null });
    }
}
