import { IsInt, Min } from 'class-validator';

export class CreateOrderDetailDto {
    @IsInt()
    orderId: number;

    @IsInt()
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;
}
