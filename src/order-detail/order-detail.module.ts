import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order-detail.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { OrderDetailService } from './order-detail.service';
import { OrderDetailController } from './order-detail.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderDetail, Order, Product]),
    ],
    controllers: [OrderDetailController],
    providers: [OrderDetailService],
    exports: [OrderDetailService],
})
export class OrderDetailModule {}
