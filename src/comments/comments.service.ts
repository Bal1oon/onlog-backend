import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/users/user.entity';
import { PostRepository } from '../posts/post.repository';

@Injectable()
export class CommentsService {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly postRepository: PostRepository
    ) {}

    getAllCommentsByPostId(postId: number): Promise<CommentEntity[]> {
        return this.commentRepository.getAllCommentsByPostId(postId);
    }

    async createComment(createCommentDto: CreateCommentDto, user: User): Promise<CommentEntity> {
        const post = await this.postRepository.getPostById(createCommentDto.postId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }

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
