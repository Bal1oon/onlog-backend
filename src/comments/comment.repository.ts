import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CommentEntity } from "./comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { User } from "src/users/user.entity";
import { PostEntity } from "src/posts/post.entity";

@Injectable()
export class CommentRepository extends Repository<CommentEntity> {
    constructor(private dataSource: DataSource) {
        super(CommentEntity, dataSource.createEntityManager());
    }

    async getAllCommentsByPostId(postId: number): Promise<CommentEntity[]> {
        return this.find({ where: { post: { id: postId } }, relations: ['user'] });
    }

    async createComment(createCommentDto: CreateCommentDto, user: User, post: PostEntity): Promise<CommentEntity> {
        const content = createCommentDto.content;

        const comment = this.create({
            content,
            user,
            post
        })

        await this.save(comment);

        return comment;
    }
}