import { Injectable, ExecutionContext, BadRequestException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { validate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer"; 
import { AuthCredentialDto } from "../dto/auth-credential.dto"; 

@Injectable()
export class LocalGuard extends AuthGuard('local') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('Guard activated');
        const request = context.switchToHttp().getRequest();
        const authCredentialDto = plainToClass(AuthCredentialDto, request.body); 

        // 유효성 검사
        const errors: ValidationError[] = await validate(authCredentialDto);
        if (errors.length > 0) {
            const messages = errors
                .flatMap(error => Object.values(error.constraints))
                .filter(Boolean);

            throw new BadRequestException({
                message: messages,
                error: 'Bad Request',
                statusCode: 400,
            });
        }

        return super.canActivate(context) as Promise<boolean>;
    }
}
