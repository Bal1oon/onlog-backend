import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { CategoryRequestDto } from './dto/category-request.dto';
import { User } from 'src/users/user.entity';
import { Category } from './category.entity';

@Controller('categories')
export class CategoryController {
    private logger = new Logger('CategoryController');
    constructor(private categoryService: CategoryService) {}

    @Post()
    @UsePipes(ValidationPipe)
    @UseGuards(AuthGuard())
    createCategory(
        @Body() categoryRequestDto: CategoryRequestDto,
        @Req() req
    ): Promise<Category> {
        const user: User = req.user;
        return this.categoryService.createCategory(categoryRequestDto, user);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    async deleteCategory(
        @Param('id', ParseIntPipe) id: number,
        @Req() req
    ): Promise<{ message: string; description: string; status: number }> {
        await this.categoryService.deleteCategory(id, req.user);
        return {
            message: "Success",
            description: `Category id ${ id } deleted`,
            status: 200
        };
    }

    @Patch('/:id')
    @UseGuards(AuthGuard())
    updateCategory(
        @Param('id', ParseIntPipe) id: number,
        @Body() categoryRequestDto: CategoryRequestDto,
        @Req() req
    ): Promise<Category> {
        const user: User = req.user;
        return this.categoryService.updateCategory(id, categoryRequestDto, user);
    }

    @Get()
    getOwnAllCategory(
        @Req() req
    ): Promise<Category[]> {
        const user: User = req.user;
        if (!user) { throw new UnauthorizedException(); }
        return this.categoryService.getOwnAllCategory(user);
    }

    @Get('/users/:username')
    getUserCategories(
        @Param('username') username: string,
        @Req() req
    ): Promise<Category[]> {
        const user: User = req.user
        if (user) {
            this.logger.log(`User ${ user.username } is getting categories for ${ username }.`);
        } else {
            this.logger.log(`A user is getting categories for ${ username }.`);
        }
        return this.categoryService.getUserCategories(username);
    }
}
