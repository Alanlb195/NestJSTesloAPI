import { Reflector } from "@nestjs/core";
import { UserRoleGuard } from "./user-role.guard";
import { BadRequestException, ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('UserRole Guard', () => {

    let guard: UserRoleGuard;
    let reflector: Reflector;
    let mockContext: ExecutionContext

    beforeEach(() => {
        reflector = new Reflector();
        guard = new UserRoleGuard(reflector);

        mockContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn()
            }),
            getHandler: jest.fn()
        } as unknown as ExecutionContext;

    });


    it('should return true if no roles are present', () => {

        jest.spyOn(reflector, 'get').mockReturnValue(undefined);

        expect(guard.canActivate(mockContext)).toBe(true);

    });


    it('should return true if no roles are required', () => {

        jest.spyOn(reflector, 'get').mockReturnValue([]);

        expect(guard.canActivate(mockContext)).toBe(true);

    });

    it('should throw bad request if user not found', () => {

        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
        jest.spyOn(mockContext.switchToHttp(), 'getRequest')
            .mockReturnValue({});

        expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
        expect(() => guard.canActivate(mockContext)).toThrow('User not found');

    });

    it('should return true if user has a valid role', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
        jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
            user: {
                roles: ['admin'],
                fullName: 'Alan LB',
            }
        });


        expect(guard.canActivate(mockContext)).toBe(true);

    });


    it('should return ForbiddenException if user lacks valid role', () => {

        const user = {
            roles: ['admin'],
            fullName: 'Alan LB'
        }

        const validRole = ['super-admin']

        jest.spyOn(reflector, 'get').mockReturnValue(validRole);
        jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
            user: {
                roles: ['admin'],
                fullName: 'Alan LB',
            }
        });

        expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(mockContext)).toThrow(
            `User ${user.fullName} need a valid role: ${validRole}`
        );

    });

});