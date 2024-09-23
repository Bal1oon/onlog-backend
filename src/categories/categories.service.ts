import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './category.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryRepository)
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async createCategory(createCategoryDto: CreateCategoryDto, user: User): Promise<Category> {
        const { name } = createCategoryDto;

        const existingCategory = await this.categoryRepository.findOne({ where: { name, user: { id: user.id } } });
        if (existingCategory) {
            throw new ConflictException('Existing Category Name');
        }
        
        const category = this.categoryRepository.create({ name, user });
        await this.categoryRepository.save(category);

        return category;
    }
}
