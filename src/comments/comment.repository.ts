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
        return this.find({ 
            where: { post: { id: postId } },
            relations: ['user', 'replies'] 
        });
    }

    async getCommentById(id: number): Promise<CommentEntity> {
        return this.findOne({ where: { id } });
    }

    async createComment(createCommentDto: CreateCommentDto, user: User, post: PostEntity, parentComment?: CommentEntity): Promise<CommentEntity> {
        const content = createCommentDto.content;

        const comment = this.create({
            content,
            user,
            post,
            parentComment
        })

        await this.save(comment);

        return comment;
    }
}