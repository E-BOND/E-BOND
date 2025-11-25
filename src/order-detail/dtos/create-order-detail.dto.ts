import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDetailDto {
    @ApiProperty({
        example: 10,
        description: 'ID de la orden.',
        type: Number,
    })
    @IsInt()
    orderId: number;

    @ApiProperty({
        example: 5,
        description: 'ID del producto.',
        type: Number,
    })
    @IsInt()
    productId: number;

    @ApiProperty({
        example: 2,
        description: 'Cantidad del producto.',
        type: Number,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    quantity: number;
}
