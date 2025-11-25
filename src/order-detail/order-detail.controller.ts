/**
 * Controlador responsable de gestionar los detalles de las órdenes.
 *
 * Funcionalidades:
 * - Listar detalles de órdenes (ADMIN)
 * - Consultar un detalle por su ID (ADMIN o dueño de la orden)
 * - Crear detalles de orden (ADMIN / proceso interno)
 * - Actualizar detalles de orden (ADMIN)
 * - Eliminar detalles de orden (ADMIN)
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
import { OrderDetailService } from './order-detail.service';
import { CreateOrderDetailDto } from './dtos/create-order-detail.dto';
import { UpdateOrderDetailDto } from './dtos/update-order-detail.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Detalles de Órdenes')
@ApiBearerAuth()
@Controller('order-details')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderDetailController {
    constructor(private readonly service: OrderDetailService) {}

    // ============================================================
    // GET /order-details (ADMIN)
    // ============================================================
    /**
     * Devuelve todos los detalles de órdenes registrados en el sistema.
     *
     * Solo accesible por administradores.
     */
    @Roles('ADMIN')
    @Get()
    @ApiOperation({
        summary: 'Listar todos los detalles de órdenes (ADMIN)',
        description: 'Devuelve una lista con todos los detalles de órdenes. Solo ADMIN.',
    })
    @ApiResponse({
        status: 200,
        description: 'Listado de detalles obtenido correctamente.',
        content: {
        'application/json': {
            example: [
            {
                id: 1,
                orderId: 12,
                productId: 33,
                quantity: 2,
                price: 49.99,
            },
            {
                id: 2,
                orderId: 13,
                productId: 21,
                quantity: 1,
                price: 19.99,
            },
            ],
        },
        },
    })
    @ApiResponse({
        status: 403,
        description: 'Acceso denegado: se requiere rol ADMIN.',
        content: {
        'application/json': {
            example: {
            statusCode: 403,
            message: 'Acceso denegado',
            error: 'Forbidden',
            },
        },
        },
    })
    findAll() {
        return this.service.findAll();
    }

    // ============================================================
    // GET /order-details/:id  (ADMIN o dueño de la orden)
    // ============================================================
    /**
     * Obtiene un detalle de orden por su ID.
     *
     * ADMIN: puede ver cualquier detalle.
     * CLIENTE: solo puede ver detalles de órdenes que le pertenezcan.
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Obtener un detalle de orden por ID',
        description: 'Devuelve la información del detalle. Clientes solo pueden ver sus propios detalles.',
    })
    @ApiParam({
        name: 'id',
        required: true,
        example: 5,
        description: 'ID del detalle de orden a consultar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Detalle de orden encontrado.',
        content: {
        'application/json': {
            example: {
            id: 5,
            orderId: 20,
            productId: 3,
            quantity: 2,
            price: 29.99,
            },
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Detalle no encontrado.',
        content: {
        'application/json': {
            example: {
            statusCode: 404,
            message: 'Detalle de orden no encontrado',
            error: 'Not Found',
            },
        },
        },
    })
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const currentUserRole = req.user.role;
        const currentUserId = Number(req.user.userId);

        if (currentUserRole === 'ADMIN') {
        return this.service.findOne(id);
        }

        // Si no es admin, forzamos filtro por userId para que solo vea lo suyo.
        return this.service.findOne(id, currentUserId);
    }

    // ============================================================
    // POST /order-details  (ADMIN / proceso interno)
    // ============================================================
    /**
     * Crea un nuevo detalle de orden. Usualmente invocado por procesos internos o ADMIN.
     */
    @Roles('ADMIN')
    @Post()
    @ApiOperation({
        summary: 'Crear detalle de orden (ADMIN)',
        description: 'Registra un nuevo detalle en una orden. Acceso restringido a ADMIN o procesos internos.',
    })
    @ApiBody({
        description: 'DTO para crear un detalle de orden',
        type: CreateOrderDetailDto,
        examples: {
        ejemplo: {
            summary: 'Creación exitosa',
            value: {
            orderId: 12,
            productId: 33,
            quantity: 2,
            price: 49.99,
            },
        },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Detalle creado exitosamente.',
        content: {
        'application/json': {
            example: {
            message: 'Detalle creado correctamente.',
            data: {
                id: 9,
                orderId: 12,
                productId: 33,
                quantity: 2,
                price: 49.99,
            },
            },
        },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos.',
        content: {
        'application/json': {
            example: {
            statusCode: 400,
            message: 'Datos inválidos en el payload',
            error: 'Bad Request',
            },
        },
        },
    })
    create(@Body() dto: CreateOrderDetailDto) {
        return this.service.create(dto);
    }

    // ============================================================
    // PATCH /order-details/:id  (ADMIN)
    // ============================================================
    /**
     * Actualiza un detalle de orden existente. Solo ADMIN.
     */
    @Roles('ADMIN')
    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar detalle de orden (ADMIN)',
        description: 'Permite actualizar cantidad, precio u otros campos del detalle de orden.',
    })
    @ApiParam({
        name: 'id',
        required: true,
        example: 5,
        description: 'ID del detalle a actualizar.',
    })
    @ApiBody({
        description: 'DTO para actualizar un detalle de orden',
        type: UpdateOrderDetailDto,
        examples: {
        ejemplo: {
            summary: 'Actualización exitosa',
            value: {
            quantity: 3,
            price: 44.99,
            },
        },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Detalle actualizado correctamente.',
        content: {
        'application/json': {
            example: {
            message: 'Detalle actualizado.',
            data: {
                id: 5,
                orderId: 20,
                productId: 3,
                quantity: 3,
                price: 44.99,
            },
            },
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Detalle no encontrado.',
        content: {
        'application/json': {
            example: {
            statusCode: 404,
            message: 'Detalle de orden no encontrado',
            error: 'Not Found',
            },
        },
        },
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateOrderDetailDto,
    ) {
        return this.service.update(id, dto);
    }

    // ============================================================
    // DELETE /order-details/:id  (ADMIN)
    // ============================================================
    /**
     * Elimina un detalle de orden. Solo ADMIN.
     */
    @Roles('ADMIN')
    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar detalle de orden (ADMIN)',
        description: 'Elimina un detalle de orden específico del sistema.',
    })
    @ApiParam({
        name: 'id',
        required: true,
        example: 7,
        description: 'ID del detalle a eliminar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Detalle eliminado correctamente.',
        content: {
        'application/json': {
            example: {
            message: 'Detalle eliminado.',
            deletedId: 7,
            },
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Detalle no encontrado.',
        content: {
        'application/json': {
            example: {
            statusCode: 404,
            message: 'Detalle de orden no encontrado',
            error: 'Not Found',
            },
        },
        },
    })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
