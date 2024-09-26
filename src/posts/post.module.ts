import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryRepository } from 'src/categories/category.repository';
import { UserRepository } from 'src/users/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    AuthModule
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository, CategoryRepository, UserRepository],
  exports: [PostService]
})
export class PostModule {}
