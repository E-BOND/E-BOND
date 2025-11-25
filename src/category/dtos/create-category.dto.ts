import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Electrónica',
        description: 'Nombre de la categoría.',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        example: 'Productos relacionados con tecnología y dispositivos electrónicos.',
        description: 'Descripción opcional de la categoría.',
        type: String,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
