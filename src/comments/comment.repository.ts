import { Injectable } from "@nestjs/common";
import { DataSource, IsNull, Repository } from "typeorm";
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
            where: { post: { id: postId }, parentComment: IsNull() },
            relations: ['replies', 'user']
        });
    }

    async getCommentById(id: number): Promise<CommentEntity> {
        return this.findOne({ where: { id }, relations: ['parentComment', 'user'] });
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

    async deleteComment(comment: CommentEntity): Promise<CommentEntity> {
        await comment.softRemove();

        return comment;
    }
}