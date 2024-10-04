import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { PostTopic } from "../enums/post-topic.enum"
import { Tag } from "src/tag/tag.entity"

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title: string

    @IsOptional()
    @IsString()
    content: string

    @IsOptional()
    @IsEnum(PostTopic)
    topic: PostTopic

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    tags: string
}