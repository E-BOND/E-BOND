import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
    @ApiProperty({
        example: 3,
        description: 'ID del producto a agregar al carrito.',
        type: Number,
    })
    @IsNotEmpty()
    @IsInt()
    productId: number;

    @ApiProperty({
        example: 2,
        description: 'Cantidad del producto (mínimo 1).',
        type: Number,
    })
    @IsNotEmpty()
    @IsInt()
    @Min(1, { message: 'La cantidad debe ser al menos 1.' })
    quantity: number;
}
