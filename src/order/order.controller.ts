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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus } from './entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    // ============================
    // OBTENER TODAS LAS ÓRDENES (SOLO ADMIN)
    // ============================
    @Roles('ADMIN')
    @Get()
    findAll() {
        return this.orderService.findAll();
    }

    // ============================
    // OBTENER MIS ÓRDENES
    // ============================
    @Get('my-orders')
    getMyOrders(@Req() req) {
        const currentUserId = Number(req.user.userId);
        return this.orderService.findOrdersByUser(currentUserId);
    }

    // ============================
    // OBTENER UNA ORDEN POR ID
    // ============================
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
        const currentUserId = Number(req.user.userId);
        const currentUserRole = req.user.role;

        if (currentUserRole === 'ADMIN') {
            return this.orderService.findOne(id);
        }

        // Cliente solo puede ver sus propias órdenes
        return this.orderService.findOne(id, currentUserId);
    }

    // ============================
    // CREAR ORDEN
    // ============================
    @Post()
    create(@Body() dto: CreateOrderDto, @Req() req) {
    const currentUserId = Number(req.user.userId);
    const currentUserRole = req.user.role;

    // Esta lógica de forzar el userId dentro del DTO no es necesaria si el servicio
    // acepta el userId por separado, pero la mantenemos si la necesitas por otras razones.
    if (currentUserRole !== 'ADMIN') {
        dto.userId = currentUserId;
    }

    // 🛑 CORRECCIÓN CLAVE: Invertir el orden de los argumentos.
    // Llama al servicio como: (userId, dto)
    return this.orderService.create(currentUserId, dto); // ✅ Correcto
}

    // ============================
    // ACTUALIZAR ORDEN (SOLO ADMIN)
    // ============================
    @Roles('ADMIN')
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateOrderDto,
    ) {
        return this.orderService.update(id, dto);
    }

    // ============================
    // CAMBIAR ESTADO
    // ============================
    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: OrderStatus,
        @Req() req,
    ) {
        const currentUserId = Number(req.user.userId);
        const currentUserRole = req.user.role;

        // Admin puede cambiar cualquier estado
        if (currentUserRole === 'ADMIN') {
            return this.orderService.updateStatus(id, status);
        }

        // Cliente solo puede cancelar sus propias órdenes
        return this.orderService.updateStatus(id, status, currentUserId);
    }

    // ============================
    // ELIMINAR ORDEN (SOLO ADMIN)
    // ============================
    @Roles('ADMIN')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.remove(id);
    }
}