import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product, Category]),
        HttpModule,
    ],
    providers: [ProductService],
    controllers: [ProductController],
    exports: [ProductService],
})
export class ProductModule {}
