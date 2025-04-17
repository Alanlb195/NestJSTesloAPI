import { validate } from "class-validator";
import { CreateUserDto } from "./create-user.dto";



describe('create-user.dto.ts', () => {


    it('should have the correct properties', async () => {

        const dto = new CreateUserDto();

        dto.email = 'test@gmail.com';
        dto.password = 'Abc123';
        dto.fullName = 'Alan LB';

        const errors = await validate(dto)

        expect(errors.length).toBe(0);

    });


    it('should throw errors if password is not valid', async () => {

        const dto = new CreateUserDto();

        const errors = await validate(dto)

        const emailError = errors.find(error => error.property === 'email');
        const passwordError = errors.find(error => error.property === 'password');
        const fullNameError = errors.find(error => error.property === 'fullName');

        expect(emailError).toBeDefined();
        expect(passwordError).toBeDefined();
        expect(fullNameError).toBeDefined();

    });


});