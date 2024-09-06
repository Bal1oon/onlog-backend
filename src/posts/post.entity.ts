import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostStatus } from "./post-status.enum";

@Entity()
export class Posts extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    status: PostStatus;

    @Column()
    like: number;

    // @OneToMany(type => Comment, comment => comment.post, { eager: false })
    // comment: Comment;

    // @ManyToOne(type => User, user => user.posts, {eager: false})
    // user: User;
}