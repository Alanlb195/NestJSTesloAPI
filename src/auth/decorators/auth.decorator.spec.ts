import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { Auth } from "./auth.decorator";
import { RoleProtected } from "./role-protected.decorator";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";
import { ValidRoles } from "../interfaces";

jest.mock('@nestjs/common', () => ({
    applyDecorators: jest.fn(),
    UseGuards: jest.fn(),
}));

jest.mock('@nestjs/passport', () => ({
    AuthGuard: jest.fn(() => 'AuthGuard'),
}));

jest.mock('../guards/user-role/user-role.guard', () => ({
    UserRoleGuard: jest.fn(() => 'UserRoleGuard'),
}));

jest.mock('./role-protected.decorator', () => ({
    RoleProtected: jest.fn(() => 'RoleProtected'),
}));


describe('Auth decorator', () => {

    it('should call applyDecorators with RoleProtected and UseGuards', () => {

        const roles: ValidRoles[] = [ValidRoles.admin, ValidRoles.superUser, ValidRoles.user];

        Auth(...roles);

        expect(applyDecorators).toHaveBeenCalledWith(
            RoleProtected(...roles),
            UseGuards(AuthGuard(), UserRoleGuard)
        )

    });

});