import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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

    @Column({ default: 0 })
    likes: number;

    @ManyToMany(type => User, user => user.likedPosts)
    @JoinTable()
    likedBy: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;
}