import { IsEnum, IsOptional, IsString } from "class-validator"
import { PostTopic } from "../enums/post-topic.enum"

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
}