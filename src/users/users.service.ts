import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}

    getUserByUsername(username: string): Promise<User> {
        return this.userRepository.getUserByUsername(username);
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.getUserById(id);

        return this.userRepository.updateUser(updateUserDto, user);
    }
}
