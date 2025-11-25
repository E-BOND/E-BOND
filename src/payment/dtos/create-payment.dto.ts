import { IsNumber, IsOptional, Min, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
    @ApiProperty({
        example: 12,
        description: 'ID de la orden para la cual se está creando el pago.',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    orderId: number;

    @ApiPropertyOptional({
        example: 5,
        description: 'ID del usuario autenticado. Este valor se inyecta desde el JWT, no debe enviarse en el body.',
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    userId?: number;

    @ApiPropertyOptional({
        example: 49.99,
        description: 'Monto del pago. Actualmente opcional, pero debería calcularse automáticamente.',
        type: Number,
        minimum: 0.01,
    })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    amount?: number;

    @ApiPropertyOptional({
        example: PaymentMethod.STRIPE,
        description: 'Método de pago (generalmente STRIPE).',
        enum: PaymentMethod,
    })
    @IsOptional()
    @IsEnum(PaymentMethod)
    method?: PaymentMethod;
}
