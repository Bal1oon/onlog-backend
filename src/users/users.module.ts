import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { PermanentDeleteUserService } from './permanent-delete-user.service';
import { PostRepository } from 'src/posts/post.repository';
import { CommentRepository } from 'src/comments/comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService, UserRepository, PermanentDeleteUserService,
    PostRepository,
    CommentRepository
  ],
  exports: [UserRepository],
})
export class UsersModule {}
