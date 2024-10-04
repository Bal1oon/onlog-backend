import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PostTopic } from "../enums/post-topic.enum";
import { PostStatus } from "../enums/post-status.enum";

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsEnum(PostStatus)
    @IsOptional()
    status: PostStatus;

    @IsEnum(PostTopic)
    topic: PostTopic;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    tags: string;
}