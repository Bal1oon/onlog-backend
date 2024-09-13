import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthCredentialDto } from "src/auth/dto/auth-credential.dto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async getUserByEmail(email: string): Promise<User> {
        const found = await this.findOne({ where: { email } });
        
        if (!found) {
            throw new NotFoundException(`Can't find User with id ${ email }`);
        }

        return found;
    }

    async getUserByUsername(username: string): Promise<User> {
        const found = await this.findOne({ where: { username }, relations: ['followed', 'following'] });
        
        if (!found) {
            throw new NotFoundException(`Can't find User with id ${ username }`);
        }

        return found;
    }

    async getUserById(id: number): Promise<User> {
        const found = await this.findOne({ where: { id }, relations: ['followed', 'following'] });
        
        if (!found) {
            throw new NotFoundException(`Can't find User with id ${ id }`);
        }

        return found;
    }

    async getUserByRefreshToken(refreshToken: string): Promise<User> {
        const found = await this.findOne({ where: { refreshToken } });

        if (!found) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return found;
    }

    async createUser(authCredentialDto: AuthCredentialDto): Promise<void> {
        const { email, username, password } = authCredentialDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.create({
            email,
            username, 
            password: hashedPassword,
            description: ''
        });

        try {
            await this.save(user);
        } catch (error) {
            if (error.code === '23505') {
                if (error.detail.includes('Key (email)')) {
                    throw new ConflictException('Existing Email');
                } else {
                    throw new ConflictException('Existing Username');
                }
            } else{
                throw new InternalServerErrorException();
            }
        }
    }

    async updateUser(updateUserDto: UpdateUserDto, user: User): Promise<User> {
        const { username, password, description, profileImage } = updateUserDto;
        
        user.username = username ?? user.username;
        user.description = description ?? user.description;
        user.profileImage = profileImage ?? user.profileImage;
        if (password) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        await this.save(user);
        return user;
    }

    async followUser(userToFollow: User, currentUser: User): Promise<User> {
        currentUser.following.push(userToFollow);
        await this.save(currentUser);
        return currentUser;
    }

    async unfollowUser(userToUnfollow: User, currentUser: User): Promise<User> {
        currentUser.following = currentUser.following.filter(followingUser => followingUser.id !== userToUnfollow.id);
        await this.save(currentUser);

        return currentUser;
    }

    async saveRefreshToken(userId: number, refreshToken: string, expiresAt: Date): Promise<void> {
        const user = await this.getUserById(userId);
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = expiresAt;
        await this.save(user);
    }
}