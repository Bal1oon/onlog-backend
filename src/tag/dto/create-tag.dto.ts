import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateTagDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^#[\w가-힣]+$/, { message: 'Tag must start with # and can only contain alphanumeric characters and underscores.' })
    name: string;
}