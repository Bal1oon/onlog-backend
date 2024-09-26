import { Module } from '@nestjs/common';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';
import { CategoryRepository } from './category.repository';
import { Category } from './category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserRepository } from 'src/users/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AuthModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, UserRepository],
  exports: [CategoryRepository]
})
export class CategoriesModule {}
