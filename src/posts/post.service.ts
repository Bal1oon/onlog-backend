import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PostEntity } from './post.entity';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatus } from './post-status.enum';
import { User } from 'src/users/user.entity';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository) {}

    // 게시물 전체 가져오기
    getAllPosts(): Promise<PostEntity[]> {
        return this.postRepository.getAllPosts();
    }

    // 특정 게시물 가져오기
    async getPostById(id: number): Promise<PostEntity> {
        const found = await this.postRepository.getPostById(id);

        if (!found) {
            throw new NotFoundException(`Post with ID ${ id } not found`);
        }

        return found;
    }

    // 게시물 생성
    createPost(createPostDto: CreatePostDto, user: User): Promise<PostEntity> {
        return this.postRepository.createPost(createPostDto, user);
    }

    // 게시물 상태 변경
    async updatePostStatus(id: number, status: PostStatus, user:User): Promise<PostEntity> {
        const post = await this.getPostById(id);

        if (post.user.id !== user.id) {
            throw new UnauthorizedException('You can only update your own posts');
        }

        return this.postRepository.updatePostStatus(post, status);
    }

    async deletePost(id: number, user: User): Promise<PostEntity> {
        const post = await this.getPostById(id);

        if (post.user.id !== user.id) {
            throw new UnauthorizedException('You can only delete your own posts');
        }

        return this.postRepository.deletePost(post);
    }
}
