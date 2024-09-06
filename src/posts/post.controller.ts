import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { Posts } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
    constructor (
        private postService: PostService
    ) {}

    @Get('/posts')
    getAllPosts(): Promise<Posts[]> {
        return this.postService.getAllPosts();
    }

    @Get('/posts/:id')
    getPostById(id: number): Promise<Posts> {
        return this.postService.getPostById(id);
    }

    @Post('/posts')
    @UsePipes(ValidationPipe)
    createPost(@Body() createPostDto: CreatePostDto): Promise<Posts> {
        return this.postService.createPost(createPostDto);
    }
}
