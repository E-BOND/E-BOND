import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiPropertyOptional({
        example: 'Electrónica y gadgets',
        description: 'Nombre actualizado de la categoría.',
    })
    name?: string;

    @ApiPropertyOptional({
        example: 'Productos electrónicos actualizados.',
        description: 'Descripción actualizada de la categoría.',
    })
    description?: string;
}
