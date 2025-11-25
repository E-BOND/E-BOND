import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';

export class UpdateCartDto extends PartialType(CreateCartDto) {
    @ApiPropertyOptional({
        example: 12,
        description: 'ID del usuario dueño del carrito.',
    })
    userId?: number;

    @ApiPropertyOptional({
        example: [1, 2, 3],
        description: 'IDs de productos actualizados en el carrito.',
        type: [Number],
    })
    productIds?: number[];
}
