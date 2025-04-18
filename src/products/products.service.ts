import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {


  private logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) { }

  async create(createProductDto: CreateProductDto, user: User) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...createProductDto,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user: user
      });

      await this.productRepository.save(product);

      return { ...product, images };

    }
    catch (error) {


      this.handleDbExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0, gender } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      },
      order: {
        id: 'ASC'
      },
      where: gender ? [{ gender }, { gender: 'unisex' }] : {},
    });

    const totalProduct = await this.productRepository.count({
      where: gender ? [{ gender }, { gender: 'unisex' }] : {},
    })

    return {
      count: totalProduct,
      pages: Math.ceil(totalProduct / limit),
      products: products.map(({ images, ...rest }) => ({
        ...rest,
        images: images.map(img => img.url)
      }))
    }

  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOne({
        where: { id: term },
        relations: ['images']
      });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with id: ${term} not found`)

    return product;

  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);


    // create queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      } else {
        product.images = await this.productImageRepository.findBy({ product: { id } })
      }

      product.user = user;

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      return this.findOnePlain(id);

    }
    catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDbExceptions(error);
    }
    finally {
      await queryRunner.release();
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute()

    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);


    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check logs');
  }
}
