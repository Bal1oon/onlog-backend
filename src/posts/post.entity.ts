import { BaseEntity, Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostStatus } from "./post-status.enum";
import { User } from "src/users/user.entity";
import { CommentEntity } from "src/comments/comment.entity";

@Entity()
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    // 공개/비공개
    @Column()
    status: PostStatus;

    @OneToMany(type => CommentEntity, comments => comments.post)
    comments: CommentEntity[];

    @ManyToOne(type => User, user => user.posts, { eager: false })
    user: User;

    @ManyToMany(type => User, user => user.likedPosts)
    @JoinTable()
    likedBy: User[];

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;
}