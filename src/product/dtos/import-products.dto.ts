import { IsOptional, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ImportProductsDto {
    @ApiPropertyOptional({
        example: [1, 2, 5],
        description: 'IDs de las categorías a importar desde DummyJSON. Debe ser un arreglo de números.',
        type: [Number],
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    categoryIds?: number[];
}
