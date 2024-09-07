import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty({ message: 'Comment should not be empty' })
    content: string;

    @IsNumber()
    postId: number;
}