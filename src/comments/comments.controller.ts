import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/users/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
@UseGuards(AuthGuard())
export class CommentsController {
    private logger = new Logger('CommentsController')
    constructor(private commentService: CommentsService) {}

    @Get('/:postId/comments')
    getAllCommentsByPostId(
        @Param('postId', ParseIntPipe) postId: number,
        @Request() req
    ): Promise<CommentEntity[]> {
        const user: User = req.user;
        return this.commentService.getAllCommentsByPostId(postId, user);
    };

    @Post('/:postId/comments')
    @UsePipes(ValidationPipe)
    createComment(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() createCommentDto: CreateCommentDto,
        @Request() req
    ): Promise<CommentEntity> {
        const user: User = req.user;
        this.logger.verbose(`User ${ user.username } creating a new comment on the post ${ postId }`);
        return this.commentService.createComment(createCommentDto, user, postId);
    }

    @Post('/:postId/comments/:parentCommentId/replies')
    @UsePipes(ValidationPipe)
    createReply(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('parentCommentId') parentCommentId: number,
        @Body() createCommentDto: CreateCommentDto,
        @Request() req
    ): Promise<CommentEntity> {
        const user: User = req.user;
        createCommentDto.parentCommentId = parentCommentId;
        this.logger.verbose(`User ${ user.username } creating a reply on comment ${ parentCommentId }`);
        return this.commentService.createComment(createCommentDto, user, postId);
    }

    @Patch('/:postId/comments/:id')
    deleteComment(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ): Promise<CommentEntity> {
        const user: User = req.user;
        this.logger.verbose(`User ${user.username} deleting comment ${id}`);
        return this.commentService.deleteComment(id, user);
    }
}
