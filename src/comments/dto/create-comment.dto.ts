import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty({ message: 'Comment should not be empty' })
    content: string;

    @IsOptional()
    @IsNumber()
    parentCommentId?: number;
}