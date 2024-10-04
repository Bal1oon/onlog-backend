import { PostEntity } from "src/posts/post.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => PostEntity, posts => posts.tags)
    @JoinTable()
    posts: PostEntity[];
}