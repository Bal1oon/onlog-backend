import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostStatus } from "./post-status.enum";
import { User } from "src/users/user.entity";

@Entity()
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    status: PostStatus;

    // @OneToMany(type => Comment, comment => comment.post, { eager: false })
    // comment: Comment;

    @ManyToOne(type => User, user => user.posts, { eager: false })
    user: User;

    @ManyToMany(type => User, user => user.likedPosts)
    likedBy: User[];
}