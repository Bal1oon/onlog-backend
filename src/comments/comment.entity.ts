import { PostEntity } from "src/posts/post.entity";
import { User } from "src/users/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class CommentEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    // 댓글 작성자
    @ManyToOne(type => User, user => user.comments, { eager: false })
    user: User

    // 댓글의 게시물
    @ManyToOne(type => PostEntity, post => post.comments)
    post: PostEntity;

    @ManyToOne(type => CommentEntity, comment => comment.replies, { nullable: true })
    parentComment: CommentEntity;

    @OneToMany(type => CommentEntity, comment => comment.parentComment)
    replies: CommentEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}