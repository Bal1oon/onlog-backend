import { IsEnum, IsNotEmpty } from "class-validator";
import { PostTopic } from "../enums/post-topic.enum";

export class CreatePostDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    content: string;

    @IsEnum(PostTopic)
    topic: PostTopic;
}