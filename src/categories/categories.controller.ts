import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { CategoryRequestDto } from './dto/category-request.dto';
import { User } from 'src/users/user.entity';
import { Category } from './category.entity';

@Controller('categories')
@UseGuards(AuthGuard())
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Post()
    @UsePipes(ValidationPipe)
    createCategory(
        @Body() categoryRequestDto: CategoryRequestDto,
        @Req() req
    ): Promise<Category> {
        const user: User = req.user;
        return this.categoryService.createCategory(categoryRequestDto, user);
    }

    @Delete('/:id')
    async deleteCategory(
        @Param('id', ParseIntPipe) id: number,
        @Req() req,
        @Res() res
    ): Promise<void> {
        await this.categoryService.deleteCategory(id, req.user);
        return res.json({
            message: "Success",
            description: `Category id ${ id } deleted`,
            status: 200
        })
    }

    @Patch(':/id')
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
        return this.categoryService.getOwnAllCategory(user);
    }
}
