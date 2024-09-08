import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthCredentialDto } from "src/auth/dto/auth-credential.dto";
import * as bycrypt from 'bcryptjs';

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async getUserByEmail(email: string): Promise<User> {
        return this.findOne({ where: { email } });
    }

    async getUserByUsername(username: string): Promise<User> {
        return this.findOne({ where: { username } });
    }

    async getUserById(id: number): Promise<User> {
        const found = await this.findOne({ where: { id } });
        
        if (!found) {
            throw new NotFoundException(`Can't find User with id ${ id }`);
        }

        return found;
    }

    async createUser(authCredentialDto: AuthCredentialDto): Promise<void> {
        const { email, username, password } = authCredentialDto;

        const salt = await bycrypt.genSalt();
        const hashedPassword = await bycrypt.hash(password, salt);

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
        
        user.username = username;
        user.password = password;
        user.description = description;
        user.profileImage = profileImage;

        await this.save(user);
        return user;
    }
}