import { IsString } from "class-validator";
import { PostEntity } from "src/posts/post.entity";

export class UserProfileDto {
    @IsString()
    username: string;

    @IsString()
    description: string;

    @IsString()
    profileImage: string;

    posts: PostEntity[]

    likedPosts: PostEntity[];
}