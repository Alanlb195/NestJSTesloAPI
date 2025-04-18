import { NestFactory } from "@nestjs/core";
import { bootstrap } from './main';
import { ApiProperty, DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

jest.mock('@nestjs/common', () => ({
    Logger: jest.fn().mockReturnValue({
        log: jest.fn(),
    }),
    ValidationPipe: jest.requireActual('@nestjs/common').ValidationPipe,
}));

jest.mock('@nestjs/core', () => ({
    NestFactory: {
        create: jest.fn().mockResolvedValue({
            setGlobalPrefix: jest.fn(),
            useGlobalPipes: jest.fn(),
            enableCors: jest.fn(),
            listen: jest.fn(),
        }),
    },
}));


jest.mock('@nestjs/swagger', () => ({
    DocumentBuilder: jest.fn().mockReturnValue({
        setTitle: jest.fn().mockReturnThis(),
        setDescription: jest.fn().mockReturnThis(),
        setVersion: jest.fn().mockReturnThis(),
        build: jest.fn(),
    }),
    ApiProperty: jest.fn(),
    SwaggerModule: {
        createDocument: jest.fn().mockReturnValue('document'),
        setup: jest.fn(),
    }
}));

jest.mock('./app.module', () => ({
    AppModule: jest.fn().mockReturnValue('AppModule'),
}));

describe('Main.ts', () => {


    let mockApp: {
        setGlobalPrefix: jest.Mock,
        useGlobalPipes: jest.Mock,
        enableCors: jest.Mock,
        listen: jest.Mock,
    }

    let mockLogger: { log: jest.Mock }

    beforeEach(() => {
        mockApp = {
            setGlobalPrefix: jest.fn(),
            useGlobalPipes: jest.fn(),
            enableCors: jest.fn(),
            listen: jest.fn(),
        };

        mockLogger = {
            log: jest.fn(),
        };

        (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
        (Logger as unknown as jest.Mock).mockReturnValue(mockLogger);
    })

    it('should create the application with the AppModule', async () => {
        await bootstrap();
        expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
        expect(mockLogger.log).toHaveBeenCalledWith('App running on port 3000')
    });


    it('should create the application running env.PORT', async () => {
        const port = process.env.PORT = '8080';
        await bootstrap();
        expect(mockLogger.log).toHaveBeenCalledWith(`App running on port ${port}`)
    });

    it('should set global prefix', async () => {
        await bootstrap();
        expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    });


    it('should use global pipes, (whitelist) (forbidNonWhitelisted)', async () => {
        await bootstrap();
        expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
            expect.objectContaining({
                errorHttpStatusCode: 400,
                validatorOptions: expect.objectContaining({
                    forbidNonWhitelisted: true,
                    forbidUnknownValues: false,
                    whitelist: true,
                }),
            }),
        );
    });

    it('should call DocumentBuilder', async () => {
        await bootstrap();
        expect(DocumentBuilder).toHaveBeenCalled();
        expect(DocumentBuilder).toHaveBeenCalledWith();
    });

    it('should create swagger document', async () => {
        await bootstrap();
        // expect(SwaggerModule.createDocument).toHaveBeenCalled();
        expect(SwaggerModule.setup).toHaveBeenCalledWith(
            'api',
            expect.anything(),
            'document',
          );
    });

});


