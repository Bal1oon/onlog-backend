import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/users/enums/user-role.enum";

export type AllowedRole = UserRole.ADMIN | UserRole.USER | 'Any';

export const Role = (roles: AllowedRole) => SetMetadata('roles', roles);