import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
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

    async followUser(id: number, user: User): Promise<User> {
        const currentUser = await this.userRepository.getUserById(user.id);
        const userToFollow = await this.userRepository.getUserById(id);

        if (currentUser.id === userToFollow.id) {
            throw new BadRequestException('Not allowed to follow yourself');
        }

        if (currentUser.following.some(followingUser => followingUser.id === userToFollow.id)) {
            throw new BadRequestException('You are already following this user');
        }

        return this.userRepository.followUser(userToFollow, currentUser);
    }

    async unfollowUser(id: number, user: User): Promise<User> {
        const currentUser = await this.userRepository.getUserById(user.id);
        const userToUnfollow = await this.userRepository.getUserById(id);

        if (currentUser.id === userToUnfollow.id) {
            throw new BadRequestException('Not allowed to unfollow yourself');
        }

        if (!currentUser.following.some(follwingUser => follwingUser.id === userToUnfollow.id)) {
            throw new BadRequestException('You are not following this user');
        }

        return this.userRepository.unfollowUser(userToUnfollow, currentUser);
    }

    async deactivateUser(id: number): Promise<User> {
        const user = await this.userRepository.getUserById(id);
        return await this.userRepository.deleteUser(user);
    }
}
