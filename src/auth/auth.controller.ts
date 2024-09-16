import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { LocalGuard } from './guards/local.guard';

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
    @UseGuards(LocalGuard)
    async login(@Req() req, @Res({ passthrough: true }) res): Promise<any> {
        const { accessToken, refreshToken } = await this.authService.logIn(req.user);

        res.setHeader('Authorization', 'Bearer ' + [accessToken, refreshToken]);
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
}
