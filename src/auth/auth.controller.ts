import { Body, Controller, Logger, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { LocalGuard } from './guards/local.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
    private logger = new Logger('AuthController');
    constructor(
        private authService: AuthService
    ) {}

    @Post('/signup')
    @UsePipes(ValidationPipe)
    signUp(@Body() authCredentialDto: AuthCredentialDto): Promise<void> {
        return this.authService.createUser(authCredentialDto);
    }

    @Post('/login')
    @UseGuards(LocalGuard)
    async login(@Req() req, @Res({ passthrough: true }) res): Promise<any> {
        const { accessToken, refreshToken } = await this.authService.logIn(req.user);

        res.setHeader('Authorization', 'Bearer ' + accessToken);
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
        });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
        });
        return {
          message: 'login success',
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
    }

    @Post('/refresh')
    async refreshToken(@Req() req, @Res() res): Promise<{ accessToken: string }> {
        const refreshTokenFromCookie = req.cookies.refreshToken;
        if (!refreshTokenFromCookie) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const newAccessToken = await this.authService.refreshAccessToken(refreshTokenFromCookie);
        res.setHeader('Authorization', 'Bearer ' + newAccessToken);
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
        });

        return res.json(newAccessToken);
    }

    @Post('/logout')
    @UseGuards(JwtRefreshGuard)
    async logout(@Req() req, @Res() res): Promise<void> {
        const userId = req.user.id;
        await this.authService.removeRefreshToken(userId);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        this.logger.log(`INFO: User ${ userId } has logged out successfully.`);
        return res.json({ message: 'Logout successful' });
    }
}
