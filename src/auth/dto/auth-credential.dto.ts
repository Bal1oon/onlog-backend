import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, { 
        message: 'Password must contain at least one special character' 
    })
    password: string;
}