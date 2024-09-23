import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCategoryDto } from './dto/create-category.dto';
import { User } from 'src/users/user.entity';
import { Category } from './category.entity';

@Controller('categories')
@UseGuards(AuthGuard())
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Post()
    @UsePipes(ValidationPipe)
    createCategory(
        @Body() createCategoryDto: CreateCategoryDto,
        @Req() req
    ): Promise<Category> {
        const user: User = req.user;
        return this.categoryService.createCategory(createCategoryDto, user);
    }
}
