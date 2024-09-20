import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/user.entity';
import { PostService } from '../posts/post.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

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

    async getCommentById(id: number): Promise<CommentEntity> {
        const found = await this.commentRepository.getCommentById(id);

        if (!found) {
            throw new NotFoundException(`Comment ${ id } not found`);
        }

        return found;
    }

    async createComment(createCommentDto: CreateCommentDto, user: User, postId: number): Promise<CommentEntity> {
        const post = await this.postService.getPostById(postId, user);

        let parentComment: CommentEntity | undefined;
        if (createCommentDto.parentCommentId) {
            parentComment = await this.getCommentById(createCommentDto.parentCommentId);
            
            if (parentComment.parentComment) {
                throw new BadRequestException('Replies can only be created for top-level comments');
            }
        }

        return this.commentRepository.createComment(createCommentDto, user, post, parentComment);
    }

    async deleteComment(id: number, user: User): Promise<CommentEntity> {
        const comment = await this.getCommentById(id);

        await this.isOwnComment(comment, user);

        return this.commentRepository.deleteComment(comment);
    }

    async isOwnComment(comment: CommentEntity, user:User): Promise<void> {
        if (comment.user.id !== user.id) {
            throw new UnauthorizedException('You can only manage your own comments');
        }
    }

    async updateComment(updateCommentDto: UpdateCommentDto, id: number, user: User): Promise<CommentEntity> {
        const comment = await this.getCommentById(id);
        await this.isOwnComment(comment, user);
        return this.commentRepository.updateComment(updateCommentDto, comment);
    }
}
