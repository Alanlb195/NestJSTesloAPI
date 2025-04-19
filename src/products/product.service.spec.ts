import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service"
import { getRepositoryToken } from "@nestjs/typeorm";
import { Product, ProductImage } from "./entities";
import { DataSource, Repository } from "typeorm";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { User } from "src/auth/entities/user.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PaginationDto } from "src/common/dtos/pagination.dto";



describe('ProductService', () => {

    let service: ProductsService;
    let productRepository: Repository<Product>
    let productImageRepository: Repository<ProductImage>

    let mockQueryRunner: {
        connect: jest.Mock;
        startTransaction: jest.Mock;
        manager: {
            delete: jest.Mock;
            save: jest.Mock;
        };
        commitTransaction: jest.Mock;
        release: jest.Mock;
        rollbackTransaction: jest.Mock;
    };

    beforeEach(async () => {

        mockQueryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            manager: {
                delete: jest.fn(),
                save: jest.fn(),
            },
            commitTransaction: jest.fn(),
            release: jest.fn(),
            rollbackTransaction: jest.fn(),
        };

        const mockQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue({
                id: 'VALID_UUID',
                title: 'Product 1',
                slug: 'product-1',
                images: [
                    {
                        id: '1',
                        url: 'image1.jpg',
                    }
                ]
            }),
        }

        const mockProductRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            preload: jest.fn(),
            remove: jest.fn(),
        }

        const mockProductImageRepository = {
            create: jest.fn(),
            findBy: jest.fn(),
        }

        const mockDataSource = {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository
                },
                {
                    provide: getRepositoryToken(ProductImage),
                    useValue: mockProductImageRepository
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource
                }
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
        productImageRepository = module.get<Repository<ProductImage>>(getRepositoryToken(ProductImage));
    })

    it('should be defined', () => {

        expect(service).toBeDefined();

    });

    it('should create a product', async () => {
        const dto = {
            title: 'Test product',
            price: 150,
            images: ['img1.jpg'],
        } as CreateProductDto;

        const { images: dtoWithNoImages, ...createDto } = dto

        const user = {
            id: '1',
            email: 'test@gmail.com'
        } as User;

        const product = {
            id: '1',
            ...createDto,
            user,
        } as unknown as Product;

        jest.spyOn(productRepository, 'create').mockReturnValue(product);
        jest.spyOn(productRepository, 'save').mockResolvedValue(product);
        jest.spyOn(productImageRepository, 'create').mockImplementation((imageData) => imageData as unknown as ProductImage);

        const result = await service.create(dto, user);
        // console.log(result);

        expect(result).toEqual(
            {
                id: '1',
                title: 'Test product',
                price: 150,
                user: { id: '1', email: 'test@gmail.com' },
                images: ['img1.jpg']
            }
        );
    });


    it('should throw a BadRequestException if create product fails', async () => {
        jest.spyOn(productRepository, 'save').mockRejectedValue({
            code: '23505',
            detail: 'Cannot create product because XYZ',
        });

        const dto = {} as CreateProductDto;
        const user = {} as User;

        await expect(service.create(dto, user)).rejects.toThrow(BadRequestException);
        await expect(service.create(dto, user)).rejects.toThrow('Cannot create product because XYZ');
    });

    it('should find all products', async () => {

        const dto = {
            limit: 10,
            offset: 0,
            gender: 'men',
        } as PaginationDto;

        const products = [
            { id: '1', title: 'Product 1', images: [{ id: '1', url: 'image1.jpg' }] },
            { id: '2', title: 'Product 1', images: [{ id: '2', url: 'image2.jpg' }] }
        ] as unknown as Product[];

        jest.spyOn(productRepository, 'find').mockResolvedValue(products);
        jest.spyOn(productRepository, 'count').mockResolvedValue(products.length);

        const result = await service.findAll(dto);
        // console.log(result);

        expect(result).toEqual({
            count: 2,
            pages: 1,
            products: products.map(product => ({
                ...product,
                images: product.images.map(image => image.url),
            }))
        })

    });


    it('should find a product by ID', async () => {

        const productId = '03397ecf-8e5c-49e8-b4b3-77c42844469a';

        const product = {
            id: productId,
            title: 'Product 1',
        } as Product;

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);

        const result = await service.findOne(productId);

        expect(result).toEqual({
            id: '03397ecf-8e5c-49e8-b4b3-77c42844469a',
            title: 'Product 1'
        });

    });


    it('should throw an error if id was not found', async () => {

        const productId = '03397ecf-8e5c-49e8-b4b3-77c42844469a';

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

        await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
        await expect(service.findOne(productId)).rejects.toThrow(`Product with id: ${productId} not found`);

    });


    it('should return product by term or slug', async () => {
        const result = await service.findOne('Product 1');

        // console.log(result);

        expect(result).toEqual(
            {
                id: 'VALID_UUID',
                title: 'Product 1',
                slug: 'product-1',
                images: [{ id: '1', url: 'image1.jpg' }]
            }
        );
    });


    it('should throw an error NotFoundException if product not found', async () => {


        const dto = {} as UpdateProductDto
        const user = {} as User;

        jest.spyOn(productRepository, 'preload').mockResolvedValue(null);

        await expect(service.update('abc', dto, user)).rejects.toThrow(new NotFoundException(`Product with id: abc not found`));

    });

    it('should update product successfully', async () => {

        const productId = 'ABC';

        const dto = {
            title: 'Updated product',
            slug: 'updated_product',
        } as UpdateProductDto

        const user = {
            id: '1',
            fullName: 'Alan LB',

        } as User;

        const product = {
            ...dto,
            price: 100,
            description: 'some description',
        } as unknown as Product;

        jest.spyOn(productRepository, 'preload').mockResolvedValue(product);
        const response = await service.update(productId, dto, user);
        // console.log(response);

        expect(response).toEqual({
            id: 'VALID_UUID',
            title: 'Product 1',
            slug: 'product-1',
            images: ['image1.jpg']
        });

    });


    it('should update product and commit transaction', async () => {

        const productId = 'ABC';

        const dto = {
            title: 'Updated product',
            slug: 'updated_product',
            images: [{ id: '1', url: 'image1.jpg' }],
        } as unknown as UpdateProductDto

        const user = {
            id: '1',
            fullName: 'Alan LB',

        } as User;

        const product = {
            ...dto,
            price: 100,
            description: 'some description',
        } as unknown as Product;

        jest.spyOn(productRepository, 'preload').mockResolvedValue(product);
        await service.update(productId, dto, user);
        // console.log(response);

        expect(mockQueryRunner.connect).toHaveBeenCalled();
        expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
        expect(mockQueryRunner.manager.delete).toHaveBeenCalled();
        expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
        expect(mockQueryRunner.release).toHaveBeenCalled();

    });

});
