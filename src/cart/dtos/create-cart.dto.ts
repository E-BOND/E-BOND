import { IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCartDto {
    @ApiProperty({
        example: 12,
        description: 'ID del usuario dueño del carrito.',
        type: Number,
    })
    @IsNumber()
    userId: number;

    @ApiPropertyOptional({
        example: [1, 5, 7],
        description: 'Lista opcional de IDs de productos iniciales.',
        type: [Number],
    })
    @IsOptional()
    @IsArray()
    productIds?: number[];
}
