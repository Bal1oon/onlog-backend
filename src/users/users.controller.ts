import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Role } from 'src/auth/decorators/role.decorator';
import { UserRole } from './enums/user-role.enum';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @Get('/:username')
    getUserByUsername(@Param('username') username: string): Promise<User> {
        return this.userService.getUserByUsername(username);
    }

    @Patch()
    @UsePipes(ValidationPipe)
    @UseGuards(AuthGuard())
    updateUser(
        @Body() updateUserDto: UpdateUserDto,
        @Request() req
    ): Promise<User> {
        const user: User = req.user;
        return this.userService.updateUser(updateUserDto, user);
    }

    @Post('/:id/follow')
    @UseGuards(AuthGuard())
    followUser(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ): Promise<User> {
        const user: User = req.user;
        return this.userService.followUser(id, user);
    }

    @Delete('/:id/follow')
    @UseGuards(AuthGuard())
    unfollowUser(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ): Promise<User> {
        const user: User = req.user;
        return this.userService.unfollowUser(id, user);
    }

    @Delete()
    @UseGuards(AuthGuard())
    deactivateUser(@Request() req): Promise<User> {
        const id = req.user.id;
        return this.userService.deactivateUser(id);
    }

    @Post('/:id/recover')
    @UseGuards(AuthGuard(), RoleGuard)
    @Role(UserRole.ADMIN)
    activateUser(@Param('id') id: number): Promise<User> {
        return this.userService.activateUser(id);
    }
}
