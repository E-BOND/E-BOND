import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDetailDto } from './create-order-detail.dto';
import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDetailDto extends PartialType(CreateOrderDetailDto) {
    @ApiPropertyOptional({
        example: 3,
        description: 'Cantidad del producto.',
        type: Number,
        minimum: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number;
}
