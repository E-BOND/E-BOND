/**
 * Controlador responsable de gestionar los roles del sistema.
 *
 * Funcionalidades:
 * - Listar roles
 * - Consultar un rol por ID
 * - Crear nuevos roles (SOLO ADMIN)
 * - Actualizar roles existentes (ADMIN)
 * - Eliminar roles (ADMIN)
 */
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { 
    ApiTags, 
    ApiBearerAuth, 
    ApiOperation, 
    ApiParam, 
    ApiBody 
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    // ============================================================
    // GET /roles
    // ============================================================
    /**
     * Obtiene la lista completa de roles registrados.
     */
    @Get()
    @ApiOperation({ summary: 'Listar todos los roles' })
    findAll() {
        return this.roleService.findAll();
    }

    // ============================================================
    // GET /roles/:id
    // ============================================================
    /**
     * Obtiene un rol por su ID.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un rol por ID' })
    @ApiParam({ name: 'id', type: Number })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.roleService.findOne(id);
    }

    // ============================================================
    // POST /roles  (ADMIN)
    // ============================================================
    /**
     * Crea un nuevo rol en el sistema.
     *
     * Solo disponible para administradores.
     */
    @Roles('ADMIN')
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo rol (ADMIN)' })
    @ApiBody({ type: CreateRoleDto })
    create(@Body() dto: CreateRoleDto) {
        return this.roleService.create(dto);
    }

    // ============================================================
    // PATCH /roles/:id  (ADMIN)
    // ============================================================
    /**
     * Actualiza un rol existente.
     *
     * Solo disponible para administradores.
     */
    @Roles('ADMIN')
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un rol por ID (ADMIN)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateRoleDto })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoleDto,
    ) {
        return this.roleService.update(id, dto);
    }

    // ============================================================
    // DELETE /roles/:id  (ADMIN)
    // ============================================================
    /**
     * Elimina un rol del sistema.
     *
     * Solo disponible para administradores.
     */
    @Roles('ADMIN')
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un rol por ID (ADMIN)' })
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.roleService.remove(id);
    }
}
