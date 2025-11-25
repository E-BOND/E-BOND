/**
 * Controlador responsable de gestionar los usuarios del sistema.
 *
 * Funcionalidades:
 * - Obtener el perfil del usuario autenticado
 * - Listar usuarios (ADMIN)
 * - Consultar usuario por ID (ADMIN)
 * - Crear usuarios (público o según flujo definido)
 * - Actualizar perfil del usuario autenticado
 * - Actualizar cualquier usuario (ADMIN)
 * - Eliminar usuarios (ADMIN)
 */
import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    Request,
    ForbiddenException,
    Post,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { 
    ApiBearerAuth, 
    ApiTags, 
    ApiOperation, 
    ApiParam, 
    ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    // ============================================================
    // GET /users/profile  (Usuario autenticado)
    // ============================================================
    /**
     * Obtiene la información completa del usuario autenticado.
     */
    @Get('profile')
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    async getProfile(@Request() req: any) {
        const user = await this.userService.findOne(req.user.userId);

        if (!user) {
            throw new ForbiddenException('Usuario no encontrado');
        }

        return user;
    }

    // ============================================================
    // GET /users  (ADMIN)
    // ============================================================
    /**
     * Obtiene la lista completa de usuarios.
     *
     * Solo disponible para administradores.
     */
    @Get()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Listar todos los usuarios (ADMIN)' })
    async findAll() {
        return this.userService.findAll();
    }

    // ============================================================
    // GET /users/:id  (ADMIN)
    // ============================================================
    /**
     * Obtiene un usuario por su ID.
     *
     * Solo disponible para administradores.
     */
    @Get(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Obtener un usuario por ID (ADMIN)' })
    @ApiParam({ name: 'id', type: Number })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    // ============================================================
    // POST /users  (PÚBLICO)
    // ============================================================
    /**
     * Crea un nuevo usuario en el sistema.
     *
     * Este endpoint es público según diseño.
     */
    @Post()
    @Public()
    @ApiOperation({ summary: 'Registrar un nuevo usuario (PUBLIC)' })
    @ApiBody({ type: CreateUserDto })
    async create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    // ============================================================
    // PATCH /users/update  (Usuario autenticado)
    // ============================================================
    /**
     * Actualiza los datos del usuario autenticado.
     */
    @Patch('update')
    @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
    @ApiBody({ type: UpdateUserDto })
    async updateProfile(@Request() req: any, @Body() dto: UpdateUserDto) {
        return this.userService.update(req.user.userId, dto);
    }

    // ============================================================
    // PATCH /users/:id  (ADMIN)
    // ============================================================
    /**
     * Actualiza un usuario específico por ID.
     *
     * Solo disponible para administradores.
     */
    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar un usuario (ADMIN)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateUserDto })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
        return this.userService.update(id, dto);
    }

    // ============================================================
    // DELETE /users/:id  (ADMIN)
    // ============================================================
    /**
     * Elimina un usuario del sistema por ID.
     *
     * Solo disponible para administradores.
     */
    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Eliminar un usuario por ID (ADMIN)' })
    @ApiParam({ name: 'id', type: Number })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.userService.delete(id);
    }
}
