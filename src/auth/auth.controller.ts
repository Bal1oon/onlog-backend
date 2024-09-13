import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('/signup')
    @UsePipes(ValidationPipe)
    signUp(@Body() authCredentialDto: AuthCredentialDto): Promise<void> {
        return this.authService.createUser(authCredentialDto);
    }

    @Post('/login')
    @UsePipes(ValidationPipe)
    login(@Body() authCredentialDto: AuthCredentialDto): Promise<{ accessToken: string, refreshToken: string }> {
        return this.authService.logIn(authCredentialDto);
    }

    @Post('/refresh')
    @UsePipes(ValidationPipe)
    refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
        return this.authService.refreshToken(refreshTokenDto);
    }
}
