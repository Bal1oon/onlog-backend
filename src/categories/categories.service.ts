import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { CategoryRequestDto } from './dto/category-request.dto';
import { Category } from './category.entity';
import { User } from 'src/users/user.entity';
import { UserRepository } from 'src/users/user.repository';

@Injectable()
export class CategoryService {
    private logger = new Logger('CategoryService');
    constructor(
        @InjectRepository(CategoryRepository)
        private readonly categoryRepository: CategoryRepository,
        private readonly userRepository: UserRepository
    ) {}

    async createCategory(categoryRequestDto: CategoryRequestDto, user: User): Promise<Category> {
        const { name } = categoryRequestDto;

        const existingCategory = await this.categoryRepository.findOne({
            where: { 
                name: name.trim(),
                user: { id: user.id } 
            }
        });
        if (existingCategory) {
            throw new ConflictException('Existing Category Name');
        }

        const category = this.categoryRepository.create({ name: name.trim(), user });
        await this.categoryRepository.save(category);

        this.logger.log(`User '${user.id}' created category - id: ${category.id}, name: ${name}`);

        return category;
    }

    private isOwn(userId1: number, userId2: number): boolean {
        return userId1 === userId2;
    }

    async deleteCategory(id: number, user: User): Promise<void> {
        const category = await this.categoryRepository.getCategoryWithPost(id);
        if (!category) {
            this.logger.warn(`User '${user.id}' attempted to delete a non-existing category - id: ${id}`);
            throw new NotFoundException('Category not found');
        }

        if (!this.isOwn(category.user.id, user.id)) {
            this.logger.warn(`User '${user.id}' attempted to delete category - id: ${id}, but does not own it`);
            throw new BadRequestException('You can only manage your own');
        }

        this.hasPosts(category);
        await this.categoryRepository.delete(id);
        this.logger.log(`User '${user.id}' deleted category - id: ${category.id}, name: '${category.name}'`);
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
            this.logger.warn(`User '${user.id}' attempted to update a non-existing category - id: ${id}`);
            throw new NotFoundException('Category not found');
        }

        if (!this.isOwn(category.user.id, user.id)) {
            this.logger.warn(`User '${user.id}' attempted to update category - id: ${id}, but does not own it`);
            throw new BadRequestException('You can only manage your own');
        }

        const { name } = categoryRequestDto;
        const beforeName = category.name;
        category.name = name;
        await this.categoryRepository.save(category);

        this.logger.log(`User '${user.id}' updated category to ${name} from ${beforeName}`);

        return category;
    }

    async getOwnAllCategory(user: User): Promise<Category[]> {
        return await this.categoryRepository.find({ where: { user: { id: user.id} }});
    }

    async getUserCategories(username: string): Promise<Category[]> {
        const user = await this.userRepository.getUserByUsername(username);
        return await this.categoryRepository.find({ where: { user: { username } } });
    }
}
