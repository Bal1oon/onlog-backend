import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async findByEmail(email: string): Promise<User> {
        return this.findOne({ where: { email } });
    }

    async findByUsername(username: string): Promise<User> {
        return this.findOne({ where: { username } });
    }
}