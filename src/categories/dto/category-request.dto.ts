import { IsNotEmpty, IsString } from "class-validator";

export class CategoryRequestDto {
    @IsString()
    @IsNotEmpty()
    name: string
}