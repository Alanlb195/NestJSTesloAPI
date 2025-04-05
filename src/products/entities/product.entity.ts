import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '0792600c-9370-48a7-887c-47bcf4618c8c',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product Price',
    })
    @Column('float', {
        default: 0
    })
    price: number

    @ApiProperty({
        example: "Dolore velit do sit exercitation.",
        description: 'Product description',
        nullable: true
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 'tshirt_teslo',
        description: 'Product slug',
        uniqueItems: true,
        nullable: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        description: 'Product sizes'
    })
    @Column('text', {
        array: true
    })
    sizes: string[];


    @ApiProperty({
        example: ['men', 'women', 'kid', 'unise']
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    // tags

    // images, one to many relation
    @ApiProperty()
    @OneToMany(
        () => ProductImage, // Entity relacionated
        (productImage) => productImage.product, // return inverse property
        { cascade: true } // insert/delete/update on cascade
    )
    images?: ProductImage[]; // inverse property

    @ManyToOne(
        () => User,
        (user) => user.product,
        {
            eager: true
        }
    )
    user: User

    @BeforeInsert()
    checkSlugInsert() {

        if (!this.slug) {
            this.slug = this.title
        }

        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }


    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }
}
