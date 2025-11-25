/**
 * Controlador responsable de gestionar las órdenes de compra.
 *
 * Funcionalidades:
 * - Listar órdenes (ADMIN)
 * - Consultar órdenes del usuario autenticado
 * - Consultar una orden por su ID (ADMIN o dueño)
 * - Crear órdenes
 * - Actualizar órdenes (ADMIN)
 * - Cambiar el estado de una orden (ADMIN o cliente solo para cancelar)
 * - Eliminar órdenes (ADMIN)
 */

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
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

import { OrderService } from './order.service';
    import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus } from './entities/order.entity';

@ApiTags('Órdenes')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    // ============================================================
    // GET /orders (ADMIN)
    // ============================================================

    /**
     * Obtiene todas las órdenes generadas en el sistema.
     *
     * Solo accesible para administradores.
     */
    @Roles('ADMIN')
    @Get()
    @ApiOperation({
        summary: 'Listar todas las órdenes (ADMIN)',
        description: 'Devuelve la colección completa de órdenes creadas en el sistema.',
    })
    @ApiResponse({
        status: 200,
        description: 'Listado de órdenes obtenido exitosamente.',
        content: {
            'application/json': {
                example: [
                    {
                        id: 1,
                        userId: 12,
                        total: 199.99,
                        status: 'PENDING',
                        createdAt: '2024-01-20T10:15:00.000Z',
                    },
                    {
                        id: 2,
                        userId: 14,
                        total: 450.0,
                        status: 'SHIPPED',
                        createdAt: '2024-01-22T14:00:00.000Z',
                    },
                ],
            },
        },
    })
    findAll() {
        return this.orderService.findAll();
    }

    // ============================================================
    // GET /orders/my-orders (CLIENTE)
    // ============================================================

    /**
     * Obtiene todas las órdenes pertenecientes al usuario actualmente autenticado.
     */
    @Get('my-orders')
    @ApiOperation({
        summary: 'Obtener mis órdenes',
        description: 'Devuelve todas las órdenes pertenecientes al usuario autenticado.',
    })
    @ApiResponse({
        status: 200,
        description: 'Órdenes del usuario obtenidas exitosamente.',
        content: {
            'application/json': {
                example: [
                    {
                        id: 5,
                        total: 89.99,
                        status: 'DELIVERED',
                    },
                    {
                        id: 7,
                        total: 150.0,
                        status: 'PENDING',
                    },
                ],
            },
        },
    })
    getMyOrders(@Req() req) {
        const currentUserId = Number(req.user.userId);
        return this.orderService.findOrdersByUser(currentUserId);
    }

    // ============================================================
    // GET /orders/:id
    // ADMIN puede ver cualquiera.
    // Cliente solo ve órdenes propias.
    // ============================================================

    /**
     * Obtiene una orden específica por su ID.
     *
     * ADMIN: puede ver cualquier orden.  
     * CLIENTE: solo puede consultar sus propias órdenes.
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Obtener una orden por su ID',
        description:
            'Devuelve los detalles de una orden. Los clientes solo pueden ver sus propias órdenes.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la orden a consultar.',
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: 'Orden encontrada.',
        content: {
            'application/json': {
                example: {
                    id: 10,
                    userId: 15,
                    total: 129.99,
                    status: 'PENDING',
                    items: [
                        { productId: 2, quantity: 1 },
                        { productId: 8, quantity: 2 },
                    ],
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Orden no encontrada.',
    })
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
        const currentUserId = Number(req.user.userId);
        const currentUserRole = req.user.role;

        if (currentUserRole === 'ADMIN') {
            return this.orderService.findOne(id);
        }

        return this.orderService.findOne(id, currentUserId);
    }

    // ============================================================
    // POST /orders
    // Crear orden
    // ============================================================

    /**
     * Crea una nueva orden.
     *
     * ADMIN: puede crear órdenes para cualquier usuario.  
     * CLIENTE: solo crea órdenes para sí mismo.
     */
    @Post()
    @ApiOperation({
        summary: 'Crear una orden',
        description:
            'Crea una nueva orden asociada al usuario autenticado, a menos que el usuario sea ADMIN.',
    })
    @ApiBody({
        type: CreateOrderDto,
        examples: {
            ejemplo: {
                summary: 'Ejemplo de creación de orden',
                value: {
                    userId: 20,
                    items: [
                        { productId: 3, quantity: 1 },
                        { productId: 7, quantity: 2 },
                    ],
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Orden creada exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Orden creada.',
                    order: {
                        id: 25,
                        userId: 20,
                        total: 199.99,
                        status: 'PENDING',
                    },
                },
            },
        },
    })
    create(@Body() dto: CreateOrderDto, @Req() req) {
        const currentUserId = Number(req.user.userId);
        const currentUserRole = req.user.role;

        if (currentUserRole !== 'ADMIN') {
            dto.userId = currentUserId;
        }

        return this.orderService.create(currentUserId, dto);
    }

    // ============================================================
    // PATCH /orders/:id (ADMIN)
    // ============================================================

    /**
     * Actualiza los datos de una orden existente.
     *
     * Solo accesible para ADMIN.
     */
    @Roles('ADMIN')
    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar una orden (ADMIN)',
        description: 'Modifica información de una orden existente.',
    })
    @ApiParam({
        name: 'id',
        example: 8,
        description: 'ID de la orden a actualizar.',
    })
    @ApiBody({
        type: UpdateOrderDto,
        examples: {
            ejemplo: {
                summary: 'Ejemplo de actualización',
                value: {
                    status: 'SHIPPED',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Orden actualizada exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Orden actualizada.',
                    data: {
                        id: 8,
                        status: 'SHIPPED',
                    },
                },
            },
        },
    })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
        return this.orderService.update(id, dto);
    }

    // ============================================================
    // PATCH /orders/:id/status
    // ============================================================

    /**
     * Actualiza únicamente el estado de una orden.
     *
     * ADMIN: puede establecer cualquier estado.  
     * CLIENTE: solo puede cancelar sus propias órdenes.
     */
    @Patch(':id/status')
    @ApiOperation({
        summary: 'Cambiar estado de una orden',
        description:
            'Modifica el estado de una orden. Los clientes solo pueden cancelar sus órdenes.',
    })
    @ApiParam({
        name: 'id',
        example: 4,
        description: 'ID de la orden cuyo estado se actualizará.',
    })
    @ApiBody({
        schema: {
            properties: {
                status: {
                    type: 'string',
                    enum: Object.values(OrderStatus),
                },
            },
        },
        examples: {
            adminEjemplo: {
                summary: 'Admin actualizando estado',
                value: {
                    status: 'SHIPPED',
                },
            },
            clienteEjemplo: {
                summary: 'Cliente cancelando orden',
                value: {
                    status: 'CANCELLED',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Estado actualizado exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Estado actualizado.',
                    data: {
                        id: 4,
                        status: 'SHIPPED',
                    },
                },
            },
        },
    })
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: OrderStatus,
        @Req() req,
    ) {
        const currentUserId = Number(req.user.userId);
        const currentUserRole = req.user.role;

        if (currentUserRole === 'ADMIN') {
            return this.orderService.updateStatus(id, status);
        }

        return this.orderService.updateStatus(id, status, currentUserId);
    }

    // ============================================================
    // DELETE /orders/:id (ADMIN)
    // ============================================================

    /**
     * Elimina una orden del sistema.
     *
     * Solo disponible para administradores.
     */
    @Roles('ADMIN')
    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar orden (ADMIN)',
        description: 'Elimina una orden específica permanentemente del sistema.',
    })
    @ApiParam({
        name: 'id',
        example: 11,
        description: 'ID de la orden a eliminar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Orden eliminada exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Orden eliminada.',
                    deletedId: 11,
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Orden no encontrada.',
    })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.remove(id);
    }
}
