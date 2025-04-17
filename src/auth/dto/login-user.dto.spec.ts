import { validate } from "class-validator";
import { LoginUserDto } from "./login-user.dto";
import { plainToClass } from "class-transformer";


describe('create-user.dto.ts', () => {


    it('should not throw errors with the correct properties', async () => {

        const dto = plainToClass(LoginUserDto, {
            email: 'test1@gmail.com',
            password: 'ABC123*a'
        });

        const errors = await validate(dto)
        // console.log(errors);

        expect(errors.length).toBe(0);
    });


    it('should throw errors if password is not valid', async () => {

        const dto = plainToClass(LoginUserDto, {
            email: 'test1@gmail.com',
            password: 'invalidPassword'
        });

        const errors = await validate(dto)
        // console.log(errors);


        const passwordError = errors.find((error) => error.property === 'password');

        expect(passwordError).toBeDefined();
        expect(passwordError.constraints).toBeDefined();
        expect(passwordError.constraints.matches).toBe('The password must have a Uppercase, lowercase letter and a number');

    });


});