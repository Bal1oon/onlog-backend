import { CommentEntity } from "src/comments/comment.entity";
import { PostEntity } from "src/posts/post.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity()
@Unique(['email'])
@Unique(['username'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    username: string;

    @Column()
    description: string;

    @Column({ nullable: true })
    profileImage: string;

    @OneToMany(type => PostEntity, posts => posts.user, { eager: true })
    posts: PostEntity[]

    @OneToMany(type => CommentEntity, comments => comments.user, { eager: true })
    comments: CommentEntity[]

    @ManyToMany(type => PostEntity, post => post.likedBy, { eager: true })
    @JoinTable()
    likedPosts: PostEntity[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}