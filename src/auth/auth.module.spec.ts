import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../app.module";
import { AuthService } from "./auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";

describe('AuthModule.ts', () => {

    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({

            imports: [
                ConfigModule.forRoot(),
                PassportModule.register({ defaultStrategy: 'jwt' }),
                JwtModule.register({
                    secret: 'test-secret',
                    signOptions: { expiresIn: '2h' }
                }),
                AppModule
            ],
            providers: [
                {
                    provide: AuthService,
                    useValue: {}
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository
                },
                {
                    provide: ConfigService,
                    useValue: {}
                },
            ]
        }).compile();

    });


    beforeEach(() => {
        module.close();
    })


    it('should be defined', () => {
        expect(module).toBeDefined();
    })


    it('should have authService as provider', () => {
        const authService = module.get<AuthService>(AuthService);
        expect(authService).toBeDefined();
    });


    it('should have authController as provider', () => {
        const controller = module.get<AuthController>(AuthController);
        expect(controller).toBeDefined();
    });


    it('should have JwtStrategy as provider', () => {
        const provider = module.get<JwtStrategy>(JwtStrategy);
        expect(provider).toBeDefined();
    });


    it('should have JwtModule as Module', () => {
        const jwtModule = module.get<JwtModule>(JwtModule);
        expect(jwtModule).toBeDefined();
    });


    

})