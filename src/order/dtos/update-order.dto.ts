import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @ApiPropertyOptional({
        example: 'PAID',
        description: 'Nuevo estado de la orden.',
        type: String,
    })
    @IsOptional()
    @IsString()
    status?: string;
}
