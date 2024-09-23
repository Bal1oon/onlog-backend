import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { CategoryRequestDto } from './dto/category-request.dto';
import { Category } from './category.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryRepository)
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async createCategory(categoryRequestDto: CategoryRequestDto, user: User): Promise<Category> {
        const { name } = categoryRequestDto;

        const existingCategory = await this.categoryRepository.findOne({
            where: { 
                name: name.trim().toUpperCase(), 
                user: { id: user.id } 
            }
        });
        if (existingCategory) {
            throw new ConflictException('Existing Category Name');
        }

        const category = this.categoryRepository.create({ name, user });
        await this.categoryRepository.save(category);

        return category;
    }

    private isOwn(userId1: number, userId2: number): boolean {
        return userId1 === userId2;
    }

    async deleteCategory(id: number, user: User): Promise<void> {
        const category = await this.categoryRepository.getCategoryWithPost(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (!this.isOwn(category.user.id, user.id)) {
            throw new BadRequestException('You can only manage your own');
        }

        this.hasPosts(category);
        await this.categoryRepository.delete(id);
    }

    private hasPosts(category: Category): void {
        const postCount = category.posts.length;
        if (postCount > 0) {
            throw new BadRequestException('You must have no posts in the category to delete it');
        }
    }

    async updateCategory(id: number, categoryRequestDto: CategoryRequestDto, user: User): Promise<Category> {
        const category = await this.categoryRepository.getCategoryWithPost(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (!this.isOwn(category.user.id, user.id)) {
            throw new BadRequestException('You can only manage your own');
        }

        const { name } = categoryRequestDto;
        category.name = name;
        await this.categoryRepository.save(category);

        return category;
    }
}
