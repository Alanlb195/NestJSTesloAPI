import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginUserDto } from "./dto";
import { User } from "./entities/user.entity";
import { use } from "passport";

describe('AuthController', () => {

    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {

        const mockAuthService = {
            create: jest.fn(),
            loginUser: jest.fn(),
            checkAuthStatus: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
            providers: [{
                provide: AuthService,
                useValue: mockAuthService,
            }],
            controllers: [AuthController],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    it('should create user with the proper DTO', async () => {
        const dto: CreateUserDto = {
            email: 'test@gmail.com',
            password: '123',
            fullName: 'Alan LB',
        }
        const result = await authController.create(dto)
        expect(authService.create).toHaveBeenCalledWith(dto);
        // console.log(result);
    });


    it('should login user with the proper DTO', async () => {
        const dto: LoginUserDto = {
            email: 'test@gmail.com',
            password: '123',
        }
        const result = await authController.auth(dto);
        expect(authService.loginUser).toHaveBeenCalledWith(dto);
        // console.log(result);
    });


    it('should check auth status with the proper DTO', async () => {
        const dto: User = {
            email: 'test@gmail.com',
            password: '123',
            // fullName: 'Alan LB',
            // isActive: true,
        } as User

        const result = await authController.checkAuthStatus(dto);
        expect(authService.checkAuthStatus).toHaveBeenCalledWith(dto);
        // console.log(result);
    });


    it('Should return private route data', async () => {

        const user = {
            id: '1',
            email: 'test@gmail.com',
            fullName: 'AlanLB'
        } as User

        const request = {} as Express.Request;
        const rawHeaders = ['header1: value1', 'header2: value2'];
        const headers = { header1: 'value1', header2: 'value2' }

        const response = await authController.testingPrivateRoute(
            request,
            user,
            user.email,
            rawHeaders,
            headers
        );
        // console.log(response);

        expect(response).toEqual(
            {
                ok: true,
                message: 'hola mundo private',
                user: { id: '1', email: 'test@gmail.com', fullName: 'AlanLB' },
                email: 'test@gmail.com',
                rawHeaders: ['header1: value1', 'header2: value2'],
                headers: { header1: 'value1', header2: 'value2' }
            }
        )

    })


});

