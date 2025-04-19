import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";
import { join } from "path";
import { existsSync } from "fs";
import { BadRequestException } from "@nestjs/common";

jest.mock('fs', () => ({
    existsSync: jest.fn(),
}))


describe('FilesService', () => {

    let service: FilesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FilesService]
        }).compile();

        service = module.get<FilesService>(FilesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('It should return the correct path if image exists', () => {
        const imageName = 'test-image.jpg';
        const expectedPath = join(__dirname, '../../static/products', imageName);
        // console.log(expectedPath);


        (existsSync as jest.Mock).mockReturnValue(true);

        const result = service.getStaticProductImage(imageName);
        // console.log(result);

        expect(result).toBe(expectedPath);

    });

    it('should throw a BadRequestException if image does not exists', () => {
        const imageName = 'test-image.jpg';

        (existsSync as jest.Mock).mockReturnValue(false);

        expect(() => service.getStaticProductImage(imageName)).toThrow(
            new BadRequestException(`No product found with image ${imageName}`)
        )

    })


});