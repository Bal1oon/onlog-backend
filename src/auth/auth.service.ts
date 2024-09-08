import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialDto } from './dto/auth-credential.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
        private jwtService: JwtService
    ) {}

    async createUser(authCredentialDto: AuthCredentialDto): Promise<void> {
        return this.userRepository.createUser(authCredentialDto);
    }

}
