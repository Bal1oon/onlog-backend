import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    AuthModule
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostRepository]
})
export class PostModule {}
