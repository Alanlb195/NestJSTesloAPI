import { SetMetadata } from "@nestjs/common";
import { ValidRoles } from "../interfaces";
import { META_ROLES, RoleProtected } from "./role-protected.decorator";


jest.mock('@nestjs/common', () => ({
    SetMetadata: jest.fn()
}));

describe('RoleProtected Decorator', () => {

    it('should set metadata with the correct roles', () => {

        const validRoles = [ValidRoles.admin, ValidRoles.superUser, ValidRoles.user];

        const result = RoleProtected(...validRoles);

        expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, validRoles);
        expect(SetMetadata).toHaveBeenCalled();

    });

});