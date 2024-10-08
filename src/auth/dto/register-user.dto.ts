import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Matches(/^\S*$/, { message: 'Username cannot contain spaces' })
    username: string

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, { message: 'Password must contain at least one special character' })
    password: string;

    @IsString()
    @IsOptional()
    description?: string;
}