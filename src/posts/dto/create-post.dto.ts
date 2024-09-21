import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { PostTopic } from "../enums/post-topic.enum";
import { PostStatus } from "../enums/post-status.enum";

export class CreatePostDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    content: string;

    @IsEnum(PostStatus)
    @IsOptional()
    status: PostStatus;

    @IsEnum(PostTopic)
    topic: PostTopic;
}