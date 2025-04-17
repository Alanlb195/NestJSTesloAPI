import { ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { getUser } from "./get-user.decorator";

jest.mock('@nestjs/common', () => ({
    createParamDecorator: jest.fn(),
    InternalServerErrorException: jest.requireActual('@nestjs/common').InternalServerErrorException,
}));

describe('get-user.decorator.ts', () => {

    const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
                user: {
                    id: 1,
                    name: 'Alan LB'
                }
            }),
        }),
    } as unknown as ExecutionContext;


    it('should return the user from the request', () => {

        const result = getUser(null, mockExecutionContext);

        expect(result).toEqual({ id: 1, name: 'Alan LB' });
    });

    it('should return the user from the request', () => {
        const result = getUser('name', mockExecutionContext);
        expect(result).toEqual('Alan LB');
    });


    it('should throw an Internal server error if user not found', () => {

        const mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    user: null,
                }),
            }),
        } as unknown as ExecutionContext;

        try {
            const result = getUser(null, mockExecutionContext);
            expect(true).toBeFalsy();
            
        } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe('User not found (request)');
        }
    });

});