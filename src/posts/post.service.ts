import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PostEntity } from './post.entity';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatus } from './enums/post-status.enum';
import { User } from 'src/users/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostTopic } from './enums/post-topic.enum';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository) {}

    // 게시물 전체 가져오기
    getAllPosts(userId?: number): Promise<PostEntity[]> {
        return this.postRepository.getAllPosts(userId);
    }

    // 특정 게시물 가져오기
    // async getPostById(id: number, userId: number): Promise<PostEntity> {
    //     const found = await this.postRepository.getPostById(id, userId);

    //     if (!found) {
    //         throw new NotFoundException(`Post with ID ${ id } not found`);
    //     }

    //     return found;
    // }
    async getPostById(id: number, user: User): Promise<PostEntity> {
        const found = await this.postRepository.getPostById(id);

        if (!found) {
            throw new NotFoundException(`Post with ID ${ id } not found`);
        } else {
            if (found.status === PostStatus.PRIVATE && found.user.id !== user.id) {
                throw new ForbiddenException(`You do not have permission to view this post`);
            }
        }

        return found;
    }

    getAllPostsInTopic(topic: PostTopic, userId?: number, ): Promise<PostEntity[]> {
        if (userId) {
            return this.postRepository.find({
                where: [
                    { topic, deletedAt: null, status: PostStatus.PUBLIC },
                    { topic, deletedAt: null, status: PostStatus.PRIVATE, user: { id: userId } }
                ],
                relations: ['user'],
                select: {
                    user: {
                        id: true,
                        email: true,
                        username: true
                    }
                },
                order: {
                    createdAt: 'DESC'
                }
            });
        } else {
            return this.postRepository.find({ 
                where: { topic, deletedAt: null, status: PostStatus.PUBLIC },
                relations: ['user'],
                select: {
                    user: {
                        id: true,
                        email: true,
                        username: true
                    }
                },
                order: { createdAt: 'DESC' }
            });
        }
    }

    // 게시물 생성
    createPost(createPostDto: CreatePostDto, user: User): Promise<PostEntity> {
        return this.postRepository.createPost(createPostDto, user);
    }

    // 게시물 상태 변경
    async updatePostStatus(id: number, status: PostStatus, user:User): Promise<PostEntity> {
        const post = await this.getPostById(id, user);

        await this.isOwnPost(post, user);

        return this.postRepository.updatePostStatus(post, status);
    }

    async deletePost(id: number, user: User): Promise<PostEntity> {
        const post = await this.getPostById(id, user);

        await this.isOwnPost(post, user);

        return this.postRepository.deletePost(post);
    }

    async isOwnPost(post: PostEntity, user:User): Promise<void> {
        if (post.user.id !== user.id) {
            throw new UnauthorizedException('You can only manage your own posts');
        }
    }

    async likePostToggle(id:number, user: User): Promise<PostEntity> {
        const found = await this.getPostById(id, user);
        return this.postRepository.likePostToggle(found, user);
    }

    async updatePost(id: number, updatePostDto: UpdatePostDto, user: User): Promise<PostEntity> {
        const post = await this.getPostById(id, user);
        await this.isOwnPost(post, user);
        return this.postRepository.updatePost(post, updatePostDto);
    }
}
