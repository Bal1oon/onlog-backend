import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostStatus } from "./enums/post-status.enum";
import { User } from "src/users/user.entity";
import { CommentEntity } from "src/comments/comment.entity";
import { PostTopic } from "./enums/post-topic.enum";
import { Category } from "src/categories/category.entity";
import { Tag } from "src/tag/tag.entity";

@Entity()
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column({ nullable: true })
    summary: string;

    // 공개/비공개
    @Column({ default: PostStatus.PUBLIC })
    status: PostStatus;

    @Column({nullable: true})   // 구현 후 null 제거
    topic: PostTopic;

    @ManyToOne(type => Category, category => category.posts)
    category: Category

    @ManyToMany(() => Tag, tags => tags.posts)
    tags: Tag[];

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