import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDetailDto } from './create-order-detail.dto';
import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateOrderDetailDto extends PartialType(CreateOrderDetailDto) {
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number;
}
