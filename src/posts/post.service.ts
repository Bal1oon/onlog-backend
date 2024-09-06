import { Injectable } from '@nestjs/common';
import { Posts } from './post.entity';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository) {}

    // 게시물 전체 가져오기
    getAllPosts(): Promise<Posts[]> {
        return this.postRepository.getAllPosts();
    }

    // 특정 게시물 가져오기
    getPostById(id: number): Promise<Posts> {
        return this.postRepository.getPostById(id);
    }

    // 게시물 생성
    createPost(createPostDto: CreatePostDto): Promise<Posts> {
        return this.postRepository.createPost(createPostDto);
    }
}
