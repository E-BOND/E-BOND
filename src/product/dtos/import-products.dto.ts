import { IsOptional, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class ImportProductsDto {
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    categoryIds?: number[];
}
