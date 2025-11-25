import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsInt, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
    @ApiPropertyOptional({
        example: 12,
        description: 'ID de la orden asociada al pago. Opcional en actualización.',
        type: Number,
    })
    @IsInt()
    @IsOptional()
    orderId?: number;

    @ApiPropertyOptional({
        example: 59.99,
        description: 'Monto del pago. Valor enviado por el cliente.',
        type: Number,
    })
    @IsNumber()
    @IsOptional()
    amount?: number;

    @ApiPropertyOptional({
        example: PaymentMethod.STRIPE,
        description: `Método de pago. Debe ser uno de: ${Object.values(PaymentMethod).join(', ')}`,
        enum: PaymentMethod,
    })
    @IsOptional()
    @IsEnum(PaymentMethod, {
        message: `El método de pago debe ser uno de los siguientes valores: ${Object.values(PaymentMethod).join(', ')}`,
    })
    method?: PaymentMethod;

    @ApiPropertyOptional({
        example: 'txn_01ABCXYZ999',
        description: 'ID del proveedor de pago (Stripe u otro).',
        type: String,
    })
    @IsOptional()
    @IsString()
    transactionId?: string;

    @ApiPropertyOptional({
        example: 'paid',
        description: 'Estado actual del pago.',
        type: String,
    })
    @IsOptional()
    @IsString()
    status?: string;
}
