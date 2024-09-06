import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Posts } from "./post.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostStatus } from "./post-status.enum";

@Injectable()
export class PostRepository extends Repository<Posts> {
    constructor(private dataSource: DataSource) {
        super(Posts, dataSource.createEntityManager());
    }

    // 전체 게시물 가져오기
    async getAllPosts(): Promise<Posts[]> {
        return this.find();
    }

    // 특정 게시물 가져오기
    async getPostById(id: number): Promise<Posts> {
        return this.findOne({ where: { id } });
    }

    // 게시물 생성
    async createPost(createPostDto: CreatePostDto): Promise<Posts> {
        const { title, description } = createPostDto;

        const post = this.create({
            title,
            description,
            status: PostStatus.PUBLIC,
            like: 0
        })

        await this.save(post);

        return post;
    }
}