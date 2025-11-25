import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiPropertyOptional({
        example: 15,
        description: 'ID del usuario que realiza la orden.',
        type: Number,
    })
    @IsOptional()
    @IsInt()
    userId: number;

    @ApiProperty({
        example: 3,
        description: 'ID del carrito asociado a la orden.',
        type: Number,
    })
    @IsInt()
    cartId: number;

    @ApiPropertyOptional({
        example: 'PENDING',
        description: 'Estado de la orden.',
        type: String,
    })
    @IsOptional()
    @IsString()
    status?: string;
}
