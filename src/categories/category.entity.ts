import { PostEntity } from "src/posts/post.entity";
import { User } from "src/users/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['name', 'user'])
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => User, user => user.categories, { nullable: false })
    user: User;

    @OneToMany(type => PostEntity, posts => posts.category)
    posts: PostEntity[];
}