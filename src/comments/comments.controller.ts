import { Body, Controller, Get, Logger, Param, Post, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/users/user.entity';

@Controller('comments')
export class CommentsController {
    private logger = new Logger('CommentsController')
    constructor(private commentService: CommentsService) {}

    @Get('/posts/:postId/comments')
    getAllCommentsByPostId(@Param('postId') postId: number): Promise<CommentEntity[]> {
        return this.commentService.getAllCommentsByPostId(postId);
    };

    @Post('/posts/:id/comments')
    @UsePipes(ValidationPipe)
    createComment(
        @Body() createCommentDto: CreateCommentDto,
        @Request() req
    ): Promise<CommentEntity> {
        const user: User = req.user;
        this.logger.verbose(`User ${ user.username } creating a new comment on the post ${ createCommentDto.postId }`);
        return this.commentService.createComment(createCommentDto, user);
    }
}
