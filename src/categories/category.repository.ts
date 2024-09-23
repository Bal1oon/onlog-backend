import { DataSource, Repository } from "typeorm";
import { Category } from "./category.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryRepository extends Repository<Category> {
    constructor(private dataSource: DataSource) {
        super(Category, dataSource.createEntityManager());
    }
}