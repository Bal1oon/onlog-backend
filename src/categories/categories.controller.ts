import { Body, Controller, Delete, Param, ParseIntPipe, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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
}
