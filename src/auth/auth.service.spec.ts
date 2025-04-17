import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service"
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { CreateUserDto, LoginUserDto } from "./dto";
import * as bcrypt from "bcryptjs";
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";


describe('AuthService', () => {

    let authService: AuthService;
    let userRepository: Repository<User>;
    const mockJwt = 'mock-jwt-token';

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    beforeEach(async () => {

        const mockUserRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
        }

        const mockJwtService = {
            sign: jest.fn().mockReturnValue(mockJwt),
        }


        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                AuthService
            ],
        }).compile();



        authService = module.get<AuthService>(AuthService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    });

    it('Should be defined', () => {
        expect(authService).toBeDefined();
    });


    it('should create user and return user with token', async () => {

        const dto: CreateUserDto = {
            email: 'test@google.com',
            password: 'ABC123',
            fullName: 'Alan LB',
        };

        const user = {
            email: dto.email,
            fullName: dto.fullName,
            id: '1',
            isActive: true,
            roles: ['user'],
        } as User;

        jest.spyOn(userRepository, 'create').mockReturnValue(user);
        jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash-random');

        const result = await authService.create(dto);
        // console.log(result);

        expect(bcrypt.hashSync).toHaveBeenCalledWith(dto.password, 10);
        expect(result).toEqual(
            {
                email: 'test@google.com',
                fullName: 'Alan LB',
                id: '1',
                isActive: true,
                roles: ['user'],
                token: mockJwt
            }
        );
    });


    it('should throw an error if email already exists', async () => {
        const dto: CreateUserDto = {
            email: 'test@google.com',
            password: 'ABC123',
            fullName: 'Alan LB',
        };

        jest
            .spyOn(userRepository, 'save')
            .mockRejectedValue({ code: '23505', detail: 'Email already exists' })

        await expect(authService.create(dto)).rejects.toThrow(BadRequestException);
        await expect(authService.create(dto)).rejects.toThrow('Email already exists');
    });


    it('should throw an internal server error', async () => {

        const dto: CreateUserDto = {
            email: 'test@google.com',
            password: 'ABC123',
            fullName: 'Alan LB',
        };

        jest.spyOn(console, 'log').mockImplementation(() => { });

        jest
            .spyOn(userRepository, 'save')
            .mockRejectedValue({ code: '191919', error: 'Unexpected error' })

        await expect(authService.create(dto)).rejects.toThrow(InternalServerErrorException);
        await expect(authService.create(dto)).rejects.toThrow('Please check server logs');

        expect(console.log).toHaveBeenCalledTimes(2);
        expect(console.log).toHaveBeenCalledWith({ code: '191919', error: 'Unexpected error' });
    });

    it('should login user and return token', async () => {
        const dto: LoginUserDto = {
            email: 'test@google.com',
            password: 'ABC123',
        };

        const user = {
            ...dto,
            password: 'ABC123',
            isActive: true,
            fullName: 'Alan LB',
            roles: ['user'],
        } as User;

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

        const result = await authService.loginUser(dto);
        // console.log(result);

        expect(result).toEqual({
            email: 'test@google.com',
            isActive: true,
            fullName: 'Alan LB',
            roles: ['user'],
            token: mockJwt
        });
        expect(result.password).not.toBeDefined();
        expect(result.password).toBeUndefined();

    });


    it('should throw UnauthorizedException if user is not found (by email)', async () => {
        const dto: LoginUserDto = {
            email: 'test@google.com',
            password: 'ABC123',
        };

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        let error: any;
        try {
            const result = await authService.loginUser(dto);
        } catch (err) {
            // console.log(err);
            error = err;
        }

        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Credentials are not valid (email)');
    });


    it('should throw UnauthorizedException if password is invalid', async () => {
        const dto: LoginUserDto = {
            email: 'test@google.com',
            password: 'wrong_password',
        };

        const fakeUser = {
            id: '123',
            email: dto.email,
            password: 'hashed_password',
        };

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(fakeUser as any);
        jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false); // simulate an invalid password


        let error: any;
        try {
            await authService.loginUser(dto);
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Credentials are not valid (password)');
    });


    it('should check auth status and return user with new token', async () => {
        const user = {
            id: '1',
            email: 'test@gmail.com',
            password: 'ABC123',
            fullName: 'Alan LB',
            isActive: true,
            roles: ['user'],
        } as User;

        const result = await authService.checkAuthStatus(user);
        // console.log(result);

        expect(result).toEqual({
            ...user,
            token: mockJwt
        })

    })


})