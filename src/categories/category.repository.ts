import { DataSource, Repository } from "typeorm";
import { Category } from "./category.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryRepository extends Repository<Category> {
    constructor(private dataSource: DataSource) {
        super(Category, dataSource.createEntityManager());
    }

    async getCategoryWithPost(id: number): Promise<Category> {
        return await this.findOne({ where: { id }, relations: ['posts', 'user'], select: { user: { id: true }} });
    }
}