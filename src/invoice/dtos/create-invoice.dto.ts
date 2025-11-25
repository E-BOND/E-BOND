import { IsNumber, IsString, IsPositive, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
    @ApiProperty({
        example: 12,
        description: 'ID del usuario al que pertenece la factura.',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    userId: number;

    @ApiProperty({
        example: 45,
        description: 'ID de la orden asociada a la factura.',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    orderId: number;

    @ApiProperty({
        example: 33,
        description: 'ID del pago asociado a la factura.',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    paymentId: number;

    @ApiProperty({
        example: 199.99,
        description: 'Monto total facturado.',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    totalAmount: number;

    @ApiProperty({
        example: 'INV-2025-0001',
        description: 'Número único de factura.',
        type: String,
        minLength: 5,
        maxLength: 50,
    })
    @IsNotEmpty()
    @IsString()
    @Length(5, 50)
    invoiceNumber: string;
}
