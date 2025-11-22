import { IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateCartDto {
    @IsNumber()
    userId: number;

    @IsOptional()
    @IsArray()
    productIds?: number[];
}
