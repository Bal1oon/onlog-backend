import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/user.entity';
import { PostService } from '../posts/post.service';

@Injectable()
export class CommentsService {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly postService: PostService
    ) {}

    async getAllCommentsByPostId(postId: number, user: User): Promise<CommentEntity[]> {
        await this.postService.getPostById(postId, user);

        return this.commentRepository.getAllCommentsByPostId(postId);
    }

    async createComment(createCommentDto: CreateCommentDto, user: User): Promise<CommentEntity> {
        const post = await this.postService.getPostById(createCommentDto.postId, user);

        let parentComment: CommentEntity | undefined;
        if (createCommentDto.parentCommentId) {
            parentComment = await this.commentRepository.getCommentById(createCommentDto.parentCommentId);
            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        return this.commentRepository.createComment(createCommentDto, user, post, parentComment);
    }
}
