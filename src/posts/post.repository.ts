import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { PostEntity } from "./post.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostStatus } from "./enums/post-status.enum";
import { User } from "src/users/user.entity";
import { UpdatePostDto } from "./dto/update-post.dto";

@Injectable()
export class PostRepository extends Repository<PostEntity> {
    private logger = new Logger('PostRepository');
    constructor(private dataSource: DataSource) {
        super(PostEntity, dataSource.createEntityManager());
    }

    // 전체 게시물 가져오기
    async getAllPosts(userId?: number): Promise<PostEntity[]> {
        if (userId) {
            return this.find({
                where: [
                    { deletedAt: null, status: PostStatus.PUBLIC },
                    { deletedAt: null, status: PostStatus.PRIVATE, user: { id: userId } }
                ],
                relations: ['user'],
                select: {
                    user: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            });
        } else {
            return this.find({ where: { deletedAt: null, status: PostStatus.PUBLIC } });
        }
    }

    // 특정 게시물 가져오기
    // async getPostById(id: number, userId: number): Promise<PostEntity> {
    //     return this.findOne({
    //         where: [
    //             { id, deletedAt: null, status: PostStatus.PUBLIC },
    //             { id, deletedAt: null, status: PostStatus.PRIVATE, user: { id: userId }}
    //         ],
    //         relations: ['user']
    //     });
    // }

    async getPostById(id: number): Promise<PostEntity> {
        return this.findOne({
            where: { id, deletedAt: null }, 
            relations: ['user', 'likedBy'],
            select: {
                user: {
                    id: true,
                    email: true,
                    username: true
                },
                likedBy: {
                    id: true,
                    email: true,
                    username: true
                }
            }
        });
    }

    // 게시물 생성
    async createPost(createPostDto: CreatePostDto, user: User): Promise<PostEntity> {
        const { title, content, topic, status } = createPostDto;

        const post = this.create({
            title,
            content,
            status: status ?? PostStatus.PUBLIC,
            topic,
            user
        })

        await this.save(post);

        return post;
    }

    // 게시물 상태 변경
    async updatePostStatus(post: PostEntity, status: PostStatus): Promise<PostEntity> {
        post.status = status;
        await this.save(post);

        return post
    }

    async deletePost(post: PostEntity): Promise<PostEntity> {
        await post.softRemove();

        return post;
    }

    async likePostToggle(post: PostEntity, user: User): Promise<PostEntity> {
        const index = post.likedBy.findIndex(likedUser => likedUser.id === user.id);

        if (index === -1) {
            post.likedBy.push(user);
            this.logger.verbose(`User ${ user.id } likes post ${ post.id }`);
        } else {
            post.likedBy.splice(index, 1);
            this.logger.verbose(`User ${ user.id } unlikes post ${ post.id }`);
        }

        post.likes = post.likedBy.length;

        await this.save(post);

        return post;
    }

    async updatePost(post: PostEntity, updatePostDto: UpdatePostDto): Promise<PostEntity> {
        const { title, content } = updatePostDto;

        if (!title && !content) {
            throw new BadRequestException();
        }

        post.title = title;
        post.content = content;

        await this.save(post);

        return post;
    }
}