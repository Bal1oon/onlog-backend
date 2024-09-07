import { Injectable } from '@nestjs/common';
import { PostEntity } from './post.entity';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatus } from './post-status.enum';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository) {}

    // 게시물 전체 가져오기
    getAllPosts(): Promise<PostEntity[]> {
        return this.postRepository.getAllPosts();
    }

    // 특정 게시물 가져오기
    getPostById(id: number): Promise<PostEntity> {
        return this.postRepository.getPostById(id);
    }

    // 게시물 생성
    createPost(createPostDto: CreatePostDto): Promise<PostEntity> {
        return this.postRepository.createPost(createPostDto);
    }

    // 게시물 상태 변경
    updatePostStatus(id: number, status: PostStatus): Promise<PostEntity> {
        return this.postRepository.updatePostStatus(id, status);
    }
}
