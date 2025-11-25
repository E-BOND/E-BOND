/**
 * Controlador encargado de gestionar el flujo de facturación.
 *
 * Funcionalidades:
 * - Listar todas las facturas (solo ADMIN)
 * - Obtener una factura por ID (cliente puede ver solo la suya)
 * - Crear facturas (solo ADMIN o procesos internos)
 * - Actualizar facturas
 * - Cancelar facturas
 * - Eliminar facturas
 *
 * Todas las rutas están protegidas por JWT y RolesGuard.
 */

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';

import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';

import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { UpdateInvoiceDto } from './dtos/update-invoice.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Facturas')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    // ============================================================
    // GET /invoices (ADMIN)
    // ============================================================

    /**
     * Obtiene todas las facturas registradas.
     *
     * Solo accesible por administradores.
     */
    @Roles('ADMIN')
    @Get()
    @ApiOperation({
        summary: 'Listar todas las facturas (ADMIN)',
        description: 'Devuelve la lista completa de facturas registradas en el sistema.',
    })
    @ApiResponse({
        status: 200,
        description: 'Listado de facturas obtenido exitosamente.',
        content: {
            'application/json': {
                example: [
                    {
                        id: 1,
                        userId: 10,
                        total: 249.99,
                        status: 'PAID',
                        createdAt: '2024-01-15T12:50:00.000Z',
                    },
                    {
                        id: 2,
                        userId: 11,
                        total: 120.00,
                        status: 'CANCELLED',
                        createdAt: '2024-01-20T15:00:00.000Z',
                    },
                ],
            },
        },
    })
    findAll() {
        return this.invoiceService.findAll();
    }

    // ============================================================
    // GET /invoices/:id (ADMIN / CUSTOMER)
    // ============================================================

    /**
     * Obtiene una factura por su ID.
     *
     * ADMIN puede ver cualquier factura.
     * El cliente solo puede ver sus propias facturas (debe manejarse en el servicio).
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Obtener factura por ID',
        description:
            'Devuelve los detalles de una factura específica. Los clientes solo pueden ver sus propias facturas.',
    })
    @ApiParam({
        name: 'id',
        example: 5,
        description: 'ID de la factura a consultar.',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Factura encontrada.',
        content: {
            'application/json': {
                example: {
                    id: 5,
                    userId: 20,
                    items: [
                        { productId: 2, quantity: 1, price: 120 },
                        { productId: 4, quantity: 2, price: 40 },
                    ],
                    total: 200,
                    status: 'PAID',
                    createdAt: '2024-02-01T10:00:00.000Z',
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Factura no encontrada.',
        content: {
            'application/json': {
                example: {
                    statusCode: 404,
                    message: 'Factura no encontrada',
                    error: 'Not Found',
                },
            },
        },
    })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.invoiceService.findOne(id);
    }

    // ============================================================
    // POST /invoices (ADMIN)
    // ============================================================

    /**
     * Crea una nueva factura.
     *
     * Esta operación es interna del sistema y solo accesible por ADMIN.
     */
    @Roles('ADMIN')
    @Post()
    @ApiOperation({
        summary: 'Crear factura (ADMIN / INTERNAL)',
        description:
            'Registra una nueva factura en el sistema. Usado tras confirmar un pago.',
    })
    @ApiBody({
        type: CreateInvoiceDto,
        examples: {
            ejemplo: {
                summary: 'Ejemplo de creación de factura',
                value: {
                    userId: 12,
                    items: [
                        { productId: 3, quantity: 1, price: 59.99 },
                        { productId: 5, quantity: 2, price: 30 },
                    ],
                    total: 119.99,
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Factura creada exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Factura creada correctamente.',
                    data: {
                        id: 8,
                        userId: 12,
                        total: 119.99,
                        status: 'PAID',
                    },
                },
            },
        },
    })
    create(@Body() dto: CreateInvoiceDto) {
        return this.invoiceService.create(dto);
    }

    // ============================================================
    // PATCH /invoices/:id (ADMIN)
    // ============================================================

    /**
     * Actualiza los datos de una factura específica.
     *
     * Solo accesible por administradores.
     */
    @Roles('ADMIN')
    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar factura (ADMIN)',
        description: 'Modifica los datos de una factura existente.',
    })
    @ApiParam({
        name: 'id',
        example: 3,
        description: 'ID de la factura a actualizar.',
    })
    @ApiBody({
        type: UpdateInvoiceDto,
        examples: {
            ejemplo: {
                summary: 'Ejemplo de actualización',
                value: {
                    status: 'PAID',
                    total: 350.5,
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Factura actualizada exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Factura actualizada.',
                    data: {
                        id: 3,
                        status: 'PAID',
                        total: 350.5,
                    },
                },
            },
        },
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateInvoiceDto,
    ) {
        return this.invoiceService.update(id, dto);
    }

    // ============================================================
    // PATCH /invoices/:id/cancel (ADMIN)
    // ============================================================

    /**
     * Cancela una factura y actualiza su estado a CANCELLED.
     *
     * Solo accesible para administradores.
     */
    @Roles('ADMIN')
    @Patch(':id/cancel')
    @ApiOperation({
        summary: 'Cancelar factura (ADMIN)',
        description: 'Marca una factura como CANCELADA.',
    })
    @ApiParam({
        name: 'id',
        example: 6,
        description: 'ID de la factura a cancelar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Factura cancelada exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Factura cancelada.',
                    data: {
                        id: 6,
                        status: 'CANCELLED',
                    },
                },
            },
        },
    })
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.invoiceService.cancel(id);
    }

    // ============================================================
    // DELETE /invoices/:id (ADMIN)
    // ============================================================

    /**
     * Elimina una factura del sistema.
     *
     * Solo accesible por administradores.
     */
    @Roles('ADMIN')
    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar factura (ADMIN)',
        description: 'Borra una factura específica del sistema.',
    })
    @ApiParam({
        name: 'id',
        example: 7,
        description: 'ID de la factura a eliminar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Factura eliminada exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Factura eliminada.',
                    deletedId: 7,
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Factura no encontrada.',
    })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.invoiceService.remove(id);
    }
}
