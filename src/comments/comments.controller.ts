import { Body, Controller, Delete, Get, Logger, Param, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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
    getAllCommentsByPostId(@Param('postId') postId: number): Promise<CommentEntity[]> {
        return this.commentService.getAllCommentsByPostId(postId);
    };

    @Post('/:postId/comments')
    @UsePipes(ValidationPipe)
    createComment(
        @Param('postId') postId: number,
        @Body(ValidationPipe) createCommentDto: CreateCommentDto,
        @Request() req
    ): Promise<CommentEntity> {
        const user: User = req.user;
        createCommentDto.postId = postId;
        this.logger.verbose(`User ${ user.username } creating a new comment on the post ${ createCommentDto.postId }`);
        return this.commentService.createComment(createCommentDto, user);
    }
}
