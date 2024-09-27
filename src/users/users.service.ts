import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}

    getUserByUsername(username: string): Promise<User> {
        return this.userRepository.getUserByUsername(username);
    }

    async updateUser(updateUserDto: UpdateUserDto, user: User): Promise<User> {
        return this.userRepository.updateUser(updateUserDto, user);
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
        const user = await this.userRepository.findOne({ where: { id }, relations: ['followed', 'following', 'following.followed'] });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // await this.resetFollow(user);    // softRemove하면 상대에겐 user가 보이지 않음
        return await this.userRepository.deleteUser(user);
    }

    async activateUser(id: number): Promise<User> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .withDeleted()
            .where('user.id = :id', { id })
            .getOne();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.deletedAt = null
        await this.userRepository.save(user);
        return user;
    }

    async resetFollow(user: User): Promise<void> {
        console.log(user.followed, user.following);
        const followingPromises = user.following.map(async followingUser => {
            followingUser.followed = followingUser.followed.filter(f => f.id !== user.id);
            return this.userRepository.save(followingUser);
        });
    
        const followers = await this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.following', 'following')
            .where('following.id = :id', { id: user.id })
            .getMany();
    
        const followerPromises = followers.map(async follower => {
            follower.following = follower.following.filter(f => f.id !== user.id);
            return this.userRepository.save(follower);
        });
    
        await Promise.all([...followingPromises, ...followerPromises]);
    
        user.followed = [];
        user.following = [];
        await this.userRepository.save(user);
    }
}
