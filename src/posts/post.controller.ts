import { Body, Controller, Get, Logger, Param, ParseIntPipe, Patch, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatusValidationPipe } from './pipes/post-status-validation.pipe';
import { PostStatus } from './post-status.enum';
import { User } from 'src/users/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
@UseGuards(AuthGuard())
export class PostController {
    private logger = new Logger('PostController');
    constructor (
        private postService: PostService
    ) {}

    @Get()
    getAllPosts(
        @Request() req
    ): Promise<PostEntity[]> {
        const user: User = req.user;
        const userId: number = user.id;
        return this.postService.getAllPosts(userId);
    }

    @Get('/:id')
    getPostById(
        @Param('id') id: number,
        @Request() req
    ): Promise<PostEntity> {
        const userId:number = req.user.id;
        return this.postService.getPostById(id, userId);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createPost(
        @Body() createPostDto: CreatePostDto,
        @Request() req
    ): Promise<PostEntity> {
        const user: User = req.user;
        this.logger.verbose(`User ${ user.username } creating a new post`);
        return this.postService.createPost(createPostDto, user);
    }

    @Patch('/:id/status')
    updatePostStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', PostStatusValidationPipe) status: PostStatus,
        @Request() req
    ) {
        const user: User = req.user;
        this.logger.verbose(`User ${ user.username } updating post ${ id } status to ${ status }`);
        return this.postService.updatePostStatus(id, status, user);
    }

    @Patch('/:id/delete')
    deletePost(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        const user: User = req.user;
        this.logger.verbose(`User ${ user.username } deleting post ${ id }`);
        return this.postService.deletePost(id, user);
    }
}
