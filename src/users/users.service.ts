import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}

    getUserByUsername(username: string): Promise<User> {
        return this.userRepository.getUserByUsername(username);
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto, user: User): Promise<User> {
        const found = await this.userRepository.getUserById(id);

        if (user.id !== id) {
            throw new ForbiddenException('You can update only your information.');
        }

        return this.userRepository.updateUser(updateUserDto, found);
    }
}
