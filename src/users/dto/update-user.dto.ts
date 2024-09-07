import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username?: string;

    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    // 영어와 숫자만 가능하도록 유효성 체크
    @Matches(/^[a-zA-Z0-9]*$/, {
        message: 'password only accepts english and number.'
    })
    password?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    profileImage?: string;
}