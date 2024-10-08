import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PostEntity } from './post.entity';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatus } from './enums/post-status.enum';
import { User } from 'src/users/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostTopic } from './enums/post-topic.enum';
import { UserRepository } from 'src/users/user.repository';
import { CategoryRepository } from 'src/categories/category.repository';
import { SummaryService } from './summary.service';
import { Tag } from 'src/tag/tag.entity';
import { TagService } from 'src/tag/tag.service';
import { CreateTagDto } from 'src/tag/dto/create-tag.dto';
import { validate } from 'class-validator';

@Injectable()
export class PostService {
    constructor(
        private readonly postRepository: PostRepository,
        private readonly userRepository: UserRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly summaryService: SummaryService,
        private readonly tagService: TagService,
    ) {}

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

    async getUserPostsByCategory(username: string, categoryName: string): Promise<PostEntity[]> {
        const user = await this.userRepository.getUserByUsername(username);
        const category = await this.categoryRepository.findOne({ where: { name: categoryName } });
        if (!category) { throw new NotFoundException(`Category ${ categoryName } not found`); }
        
        const posts = this.postRepository.find({ where: { user: { username }, category: { name: categoryName } } });
        return posts;
    }

    // 게시물 생성
    async createPost(createPostDto: CreatePostDto, user: User): Promise<PostEntity> {
        const summary = await this.summaryService.summarizeContent(createPostDto.content);
        
        const tagNames = createPostDto.tags.split(' ');
        const createTagDtos: CreateTagDto[] = tagNames.map(tagName => {
            const createTagDto = new CreateTagDto();
            createTagDto.name = tagName.trim();
            return createTagDto;
        });
    
        const tags = await this.createTag(createTagDtos);
    
        const post = this.postRepository.create({ ...createPostDto, tags, summary, user });
        await this.postRepository.save(post);
    
        return post;
    }
    

    async createTag(createTagDtos: CreateTagDto[]): Promise<Tag[]> {       
        const tags: Tag[] = await Promise.all(
            createTagDtos.map(async (createTagDto) => {
                const errors = await validate(createTagDto);
                if (errors.length > 0) {
                    throw new BadRequestException(`Tag '${createTagDto.name}' is invalid: ${errors.map(err => Object.values(err.constraints)).join(', ')}`);
                }

                let tag = await this.tagService.getTagByName(createTagDto.name);
                if (!tag) {
                    tag = await this.tagService.createTag(createTagDto);
                }
                return tag;
            }),
        );

        return tags;
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

        const { title, content, topic, tags } = updatePostDto;
        let summary: string;
        if (content) {
            summary = await this.summaryService.summarizeContent(content);
        }
    
        post.title = title ?? post.title;
        post.content = content ?? post.content;
        post.summary = summary ?? post.summary;
        post.topic = topic ?? post.topic;
    
        if (tags) {
            const tagNames = tags.split(' ');
            const createTagDtos: CreateTagDto[] = tagNames.map(tagName => {
                const createTagDto = new CreateTagDto();
                createTagDto.name = tagName.trim();
                return createTagDto;
            });

            const newTags = await this.createTag(createTagDtos);
            post.tags = newTags;
        }
    
        return this.postRepository.updatePost(post, updatePostDto);
    }
}
