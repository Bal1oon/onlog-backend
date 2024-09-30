import { Category } from "src/categories/category.entity";
import { CommentEntity } from "src/comments/comment.entity";
import { PostEntity } from "src/posts/post.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

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

    @Column({ default: '' })
    description: string;

    @Column({ nullable: true })
    profileImage: string;

    @OneToMany(type => Category, categories => categories.user)
    categories: Category[]

    @OneToMany(type => PostEntity, posts => posts.user, { eager: false })
    posts: PostEntity[]

    @OneToMany(type => CommentEntity, comments => comments.user, { eager: false })
    comments: CommentEntity[]

    @ManyToMany(type => PostEntity, post => post.likedBy, { eager: false })
    @JoinTable()
    likedPosts: PostEntity[]

    // 사용자를 팔로우하는 사용자
    @ManyToMany(type => User, user => user.following)
    @JoinTable()
    followed: User[]

    // 사용자가 팔로우하는 사용자
    @ManyToMany(type => User, user => user.followed)
    following: User[]

    @Column({ nullable: true })
    refreshToken?: string;

    @Column({ type: 'timestamp', nullable: true})
    refreshTokenExpiresAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}