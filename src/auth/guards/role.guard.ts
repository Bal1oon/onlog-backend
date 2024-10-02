import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { AllowedRole } from "../decorators/role.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.get<AllowedRole>('roles', context.getHandler());
        if (!requiredRoles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) return false;
        if (requiredRoles.includes('Any')) return true;

        return requiredRoles.includes(user.role);
    }
}