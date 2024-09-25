import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @Get('/:username')
    getUserByUsername(@Param('username') username: string): Promise<User> {
        return this.userService.getUserByUsername(username);
    }

    @Patch('/:id')
    @UsePipes(ValidationPipe)
    @UseGuards(AuthGuard())
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req
    ): Promise<User> {
        const user: User = req.user;
        return this.userService.updateUser(id, updateUserDto, user);
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
}
