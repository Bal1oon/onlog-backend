import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { CommentRepository } from './comment.repository';
import { PostModule } from 'src/posts/post.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    PostModule,
    AuthModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentRepository]
})
export class CommentsModule {}
