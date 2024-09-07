import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatusValidationPipe } from './pipes/post-status-validation.pipe';
import { PostStatus } from './post-status.enum';

@Controller('post')
export class PostController {
    constructor (
        private postService: PostService
    ) {}

    @Get('/posts')
    getAllPosts(): Promise<PostEntity[]> {
        return this.postService.getAllPosts();
    }

    @Get('/posts/:id')
    getPostById(@Param('id') id: number): Promise<PostEntity> {
        return this.postService.getPostById(id);
    }

    @Post('/posts')
    @UsePipes(ValidationPipe)
    createPost(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
        return this.postService.createPost(createPostDto);
    }

    @Patch('/posts/:id/status')
    updatePostStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', PostStatusValidationPipe) status: PostStatus
    ) {
        return this.postService.updatePostStatus(id, status);
    }
}
