/**
 * Controlador responsable de gestionar los pagos del sistema.
 *
 * Funcionalidades:
 * - Crear sesión de pago con Stripe
 * - Verificar pagos después del checkout
 * - Registrar pagos manuales (cash, transferencia)
 * - Listar todos los pagos (ADMIN)
 * - Consultar un pago por su ID
 * - Actualizar pagos (ADMIN)
 * - Eliminar pagos (ADMIN)
 * - Recibir eventos del webhook de Stripe
 */
import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    Patch,
    Delete,
    Query,
    Req,
    Headers,
    HttpStatus,
    BadRequestException,
    Res,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdatePaymentDto } from './dtos/update-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    // ============================================================
    // POST /payments/stripe/checkout  (Cliente autenticado)
    // ============================================================
    /**
     * Crea una sesión de pago en Stripe asociada al usuario autenticado.
     */
    @ApiOperation({ summary: 'Crear sesión de pago en Stripe' })
    @ApiResponse({ status: 201, description: 'Sesión creada correctamente.' })
    @ApiBody({ type: CreatePaymentDto })
    @Post('stripe/checkout')
    createStripeCheckout(@Body() dto: CreatePaymentDto, @Req() req) {
        const currentUserId = Number(req.user.userId);
        dto.userId = currentUserId;

        return this.paymentService.createStripeCheckout(dto);
    }

    // ============================================================
    // GET /payments/verify?sessionId=xxx  (Cliente autenticado)
    // ============================================================
    /**
     * Verifica el estado de un pago realizado mediante Stripe Checkout.
     */
    @ApiOperation({ summary: 'Verificar pago de Stripe' })
    @ApiQuery({ name: 'sessionId', required: true })
    @ApiResponse({ status: 200, description: 'Pago verificado.' })
    @Get('verify')
    verifyPayment(@Query('sessionId') sessionId: string) {
        if (!sessionId) {
            throw new BadRequestException('Se requiere el ID de sesión para la verificación.');
        }

        return this.paymentService.verifyStripePayment(sessionId);
    }

    // ============================================================
    // POST /payments/manual  (ADMIN o cliente para sí mismo)
    // ============================================================
    /**
     * Registra un pago manual (efectivo, transferencia).
     *
     * ADMIN: puede crear pagos manuales para cualquier usuario.
     * CLIENTE: solo puede registrar pagos para sí mismo.
     */
    @ApiOperation({ summary: 'Registrar pago manual' })
    @ApiBody({ type: CreatePaymentDto })
    @ApiResponse({ status: 201, description: 'Pago registrado correctamente.' })
    @Post('manual')
    createManualPayment(@Body() dto: CreatePaymentDto, @Req() req) {
        const currentUserId = Number(req.user.userId);
        const currentUserRole = req.user.role;

        if (currentUserRole !== 'ADMIN') {
            dto.userId = currentUserId;
        }

        return this.paymentService.createManualPayment(dto);
    }

    // ============================================================
    // GET /payments  (ADMIN)
    // ============================================================
    /**
     * Obtiene la lista completa de pagos.
     *
     * Solo disponible para administradores.
     */
    @ApiOperation({ summary: 'Listar todos los pagos (ADMIN)' })
    @ApiResponse({ status: 200, description: 'Lista de pagos obtenida.' })
    @Roles('ADMIN')
    @Get()
    findAll() {
        return this.paymentService.findAll();
    }

    // ============================================================
    // GET /payments/:id  (ADMIN o dueño del pago)
    // ============================================================
    /**
     * Obtiene un pago por su ID.
     *
     * ADMIN: puede ver cualquier pago.
     * CLIENTE: solo puede ver sus propios pagos.
     */
    @ApiOperation({ summary: 'Obtener un pago por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Pago encontrado.' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.findOne(id);
    }

    // ============================================================
    // PATCH /payments/:id  (ADMIN)
    // ============================================================
    /**
     * Actualiza un pago existente.
     *
     * Solo disponible para administradores.
     */
    @ApiOperation({ summary: 'Actualizar pago (ADMIN)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdatePaymentDto })
    @ApiResponse({ status: 200, description: 'Pago actualizado.' })
    @Roles('ADMIN')
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePaymentDto,
    ) {
        return this.paymentService.update(id, dto);
    }

    // ============================================================
    // DELETE /payments/:id  (ADMIN)
    // ============================================================
    /**
     * Elimina un pago por su ID.
     *
     * Solo disponible para administradores.
     */
    @ApiOperation({ summary: 'Eliminar pago (ADMIN)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Pago eliminado.' })
    @Roles('ADMIN')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.remove(id);
    }

    // ============================================================
    // POST /payments/webhook  (Stripe → Servidor)
    // ============================================================
    /**
     * Maneja los eventos enviados por Stripe mediante webhook.
     *
     * Este endpoint debe recibir `rawBody` para validar la firma del evento.
     */
    @ApiOperation({ summary: 'Webhook oficial de Stripe' })
    @ApiResponse({ status: 200, description: 'Evento procesado.' })
    @ApiResponse({ status: 400, description: 'Error validando el evento.' })
    @Post('webhook')
    async handleStripeWebhook(
        @Req() req: RawBodyRequest<ExpressRequest>,
        @Headers('stripe-signature') signature: string,
        @Res() res: ExpressResponse,
    ) {
        try {
            await this.paymentService.handleStripeWebhook(
                req.rawBody,
                signature,
            );

            return res.status(HttpStatus.OK).send({ received: true });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).send({ message: error.message });
        }
    }
}
