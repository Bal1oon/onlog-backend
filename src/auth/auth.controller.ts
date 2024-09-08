import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialDto } from './dto/auth-credential.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('/signup')
    signUp(@Body(ValidationPipe) authCredentialDto: AuthCredentialDto): Promise<void> {
        return this.authService.createUser(authCredentialDto);
    }

    @Post('/login')
    login(@Body(ValidationPipe) authCredentialDto: AuthCredentialDto): Promise<{ accessToken: string }> {
        return this.authService.logIn(authCredentialDto);
    }
}
