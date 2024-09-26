import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryRepository } from 'src/categories/category.repository';
import { UserRepository } from 'src/users/user.repository';
import { SummaryService } from './summary.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    AuthModule,
    HttpModule,
  ],
  controllers: [PostController],
  providers: [
    PostService, SummaryService,
    PostRepository, CategoryRepository, UserRepository
  ],
  exports: [PostService]
})
export class PostModule {}
