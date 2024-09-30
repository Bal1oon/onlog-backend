import { Body, Controller, Logger, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from 'src/users/user.entity';

@Controller('auth')
export class AuthController {
    private logger = new Logger('AuthController');
    constructor(
        private authService: AuthService
    ) {}

    @Post('/signup')
    @UsePipes(ValidationPipe)
    signUp(@Body() registerUserDto: RegisterUserDto): Promise<User> {
        return this.authService.registerUser(registerUserDto);
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

        this.logger.log(`User '${req.user.id}' logged in successfully.`);

        return {
            message: 'Login success',
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }

    @Post('/refresh')
    @UseGuards(JwtRefreshGuard)
    async refreshToken(@Req() req, @Res() res): Promise<{ accessToken: string }> {
        const refreshTokenFromCookie = req.cookies.refreshToken;
        if (!refreshTokenFromCookie) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const { accessToken: newAccessToken } = await this.authService.refreshAccessToken(refreshTokenFromCookie);
        res.setHeader('Authorization', 'Bearer ' + newAccessToken);
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
        });

        this.logger.log(`User ${req.user.id} issued new access token successfully.`);

        return res.json({
            message: 'Issued access token successfully',
            accessToken: newAccessToken
        });
    }

    @Post('/logout')
    @UseGuards(JwtRefreshGuard)
    async logout(@Req() req, @Res() res): Promise<void> {
        const userId = req.user.id;
        await this.authService.removeRefreshToken(userId);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        this.logger.log(`User ${userId} has logged out successfully.`);

        return res.json({ message: 'Logout successful' });
    }
}
