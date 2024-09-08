import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @Get('/:username')
    getUserByUsername(@Param('username') username: string): Promise<User> {
        return this.userService.getUserByUsername(username);
    }

    @Patch('/:id')
    @UsePipes(ValidationPipe)
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return this.userService.updateUser(id, updateUserDto);
    }
}
