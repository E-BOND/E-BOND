/**
 * Controlador encargado de gestionar el carrito de compras de los usuarios.
 *
 * Permite a los clientes:
 * - Obtener su carrito
 * - Agregar o actualizar productos
 * - Eliminar productos del carrito
 * - Realizar pago del carrito
 *
 * Además, proporciona endpoints exclusivos para administradores:
 * - Ver todos los carritos
 * - Consultar un carrito por ID
 *
 * Todos los endpoints requieren autenticación JWT.
 */

import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';

import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AddCartItemDto } from './dtos/add-cart-item.dto';

@ApiTags('Carritos')
@ApiBearerAuth()
@Controller('carts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
    constructor(private readonly cartService: CartService) {}

    // ============================================================
    // Obtener el carrito del usuario autenticado
    // ============================================================

    /**
     * Obtiene el carrito activo del usuario autenticado.
     *
     * Si no existe un carrito previo, se genera uno automáticamente.
     */
    @Get('my')
    @ApiOperation({
        summary: 'Obtener mi carrito',
        description:
            'Devuelve el carrito del usuario autenticado. Si no existe, se crea uno automáticamente.',
    })
    @ApiResponse({
        status: 200,
        description: 'Carrito obtenido exitosamente.',
        content: {
            'application/json': {
                example: {
                    id: 12,
                    userId: 4,
                    total: 59.98,
                    items: [
                        {
                            productId: 1,
                            name: 'Pc Gamer',
                            quantity: 2,
                            price: 29.99,
                        },
                    ],
                },
            },
        },
    })
    getCart(@Req() req: any) {
        const userId = Number(req.user.userId);
        return this.cartService.findOrCreateCart(userId);
    }

    // ============================================================
    // Agregar o actualizar un producto del carrito
    // ============================================================

    /**
     * Agrega un producto al carrito del usuario o actualiza su cantidad.
     *
     * El usuario define la cantidad a agregar.
     */
    @Post('item')
    @ApiOperation({
        summary: 'Agregar o actualizar un producto en el carrito',
        description:
            'Permite agregar un producto al carrito del usuario o actualizar su cantidad.',
    })
    @ApiBody({
        type: AddCartItemDto,
        examples: {
            ejemplo: {
                summary: 'Agregar producto',
                value: {
                    productId: 10,
                    quantity: 3,
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Producto agregado o actualizado correctamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Producto agregado/actualizado exitosamente.',
                    cart: {
                        id: 12,
                        items: [
                            { productId: 10, quantity: 3 },
                        ],
                    },
                },
            },
        },
    })
    addItem(@Req() req: any, @Body() dto: AddCartItemDto) {
        const userId = Number(req.user.userId);
        return this.cartService.addOrUpdateProduct(
            userId,
            dto.productId,
            dto.quantity,
        );
    }

    // ============================================================
    // Eliminar un producto del carrito
    // ============================================================

    /**
     * Elimina un producto del carrito del usuario.
     */
    @Delete('item/:productId')
    @ApiOperation({
        summary: 'Eliminar un producto del carrito',
        description:
            'Permite eliminar un producto del carrito del usuario autenticado.',
    })
    @ApiParam({
        name: 'productId',
        required: true,
        example: 10,
        description: 'ID del producto a eliminar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Producto eliminado correctamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Producto eliminado del carrito.',
                    removedProductId: 10,
                },
            },
        },
    })
    removeItem(
        @Req() req: any,
        @Param('productId', ParseIntPipe) productId: number,
    ) {
        const userId = Number(req.user.userId);
        return this.cartService.removeProduct(userId, productId);
    }

    // ============================================================
    // Pago del carrito
    // ============================================================

    /**
     * Realiza el Pago del carrito del usuario autenticado.
     *
     * Con esto se genera una "orden" o "compra" final.
     */
    @Patch('checkout')
    @ApiOperation({
        summary: 'Realizar pago del carrito',
        description:
            'Finaliza la compra del carrito del usuario. Puede generar una orden o proceso de pago.',
    })
    @ApiResponse({
        status: 200,
        description: 'Pago realizado exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Pago completado.',
                    orderId: 87,
                    total: 120.5,
                },
            },
        },
    })
    async checkout(@Req() req: any) {
        const userId = Number(req.user.userId);
        const cart = await this.cartService.findOrCreateCart(userId);
        return this.cartService.checkout(cart.id);
    }

    // ============================================================
    // Obtener todos los carritos (ADMIN)
    // ============================================================

    /**
     * Devuelve una lista de todos los carritos registrados en el sistema.
     *
     * Solo accesible por administradores.
     */
    @Roles('ADMIN')
    @Get()
    @ApiOperation({
        summary: 'Obtener todos los carritos (ADMIN)',
        description: 'Lista todos los carritos del sistema. Solo para administradores.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista obtenida correctamente.',
        content: {
            'application/json': {
                example: [
                    {
                        id: 1,
                        userId: 4,
                        total: 99.95,
                    },
                    {
                        id: 2,
                        userId: 7,
                        total: 39.99,
                    },
                ],
            },
        },
    })
    findAll() {
        return this.cartService.findAll();
    }

    // ============================================================
    // Obtener un carrito específico (ADMIN)
    // ============================================================

    /**
     * Devuelve el carrito correspondiente al ID proporcionado.
     *
     * Solo accesible por administradores.
     */
    @Roles('ADMIN')
    @Get(':id')
    @ApiOperation({
        summary: 'Obtener un carrito por ID (ADMIN)',
        description:
            'Devuelve un carrito específico según su ID. Solo disponible para administradores.',
    })
    @ApiParam({
        name: 'id',
        required: true,
        example: 3,
        description: 'ID del carrito a consultar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Carrito encontrado.',
        content: {
            'application/json': {
                example: {
                    id: 3,
                    userId: 8,
                    total: 49.99,
                    items: [],
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Carrito no encontrado.',
        content: {
            'application/json': {
                example: {
                    statusCode: 404,
                    message: 'Carrito no encontrado',
                    error: 'Not Found',
                },
            },
        },
    })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.cartService.findOne(id);
    }
}
