import { Injectable } from "@nestjs/common";
import { DataSource, IsNull, Repository } from "typeorm";
import { PostEntity } from "./post.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostStatus } from "./post-status.enum";
import { User } from "src/users/user.entity";

@Injectable()
export class PostRepository extends Repository<PostEntity> {
    constructor(private dataSource: DataSource) {
        super(PostEntity, dataSource.createEntityManager());
    }

    // 전체 게시물 가져오기
    async getAllPosts(): Promise<PostEntity[]> {
        return this.find({ where: { deletedAt: null } });
    }

    // 특정 게시물 가져오기
    async getPostById(id: number): Promise<PostEntity> {
        return this.findOne({ where: { id, deletedAt: null }, relations: ['user'] });
    }

    // 게시물 생성
    async createPost(createPostDto: CreatePostDto, user: User): Promise<PostEntity> {
        const { title, content } = createPostDto;

        const post = this.create({
            title,
            content,
            status: PostStatus.PUBLIC,
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
}