/**
 * Controlador encargado de gestionar las categorías de productos.
 *
 * Permite:
 * - Listar categorías
 * - Obtener una categoría por su ID
 * - Crear nuevas categorías (solo ADMIN)
 * - Actualizar categorías existentes (solo ADMIN)
 * - Eliminar categorías (solo ADMIN)
 *
 * Todas las rutas requieren autenticación JWT y validación de roles.
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

import { CategoryService } from './category.service';
    import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Categorías')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    // ============================================================
    // Obtener todas las categorías
    // ============================================================

    /**
     * Devuelve una lista con todas las categorías registradas en el sistema.
     *
     * Accesible por cualquier usuario autenticado.
     */
    @Get()
    @ApiOperation({
        summary: 'Obtener todas las categorías',
        description: 'Devuelve la lista completa de categorías registradas.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de categorías obtenida correctamente.',
        content: {
            'application/json': {
                example: [
                    { id: 1, name: 'Electrónica', description: 'Tecnología y gadgets.' },
                    { id: 2, name: 'Eletrodomésticos', description: 'Para el hogar.' },
                ],
            },
        },
    })
    findAll() {
        return this.categoryService.findAll();
    }

    // ============================================================
    // Obtener una categoría por ID
    // ============================================================

    /**
     * Obtiene los datos de una categoría específica según su ID.
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Obtener categoría por ID',
        description: 'Devuelve la información de una categoría específica.',
    })
    @ApiParam({
        name: 'id',
        required: true,
        example: 2,
        description: 'ID de la categoría que desea consultar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Categoría encontrada correctamente.',
        content: {
            'application/json': {
                example: {
                    id: 1,
                    name: 'Electrónica',
                    description: 'Tecnología y productos electrónicos.',
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Categoría no encontrada.',
        content: {
            'application/json': {
                example: {
                    statusCode: 404,
                    message: 'Categoría no encontrada',
                    error: 'Not Found',
                },
            },
        },
    })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.findOne(id);
    }

    // ============================================================
    // Crear una nueva categoría (ADMIN)
    // ============================================================

    /**
     * Crea una nueva categoría de productos.
     *
     * Solo accesible para administradores.
     */
    @Roles('ADMIN')
    @Post()
    @ApiOperation({
        summary: 'Crear categoría (ADMIN)',
        description: 'Registra una nueva categoría en el sistema. Solo ADMIN.',
    })
    @ApiBody({
        type: CreateCategoryDto,
        examples: {
            ejemplo: {
                summary: 'Crear categoría',
                value: {
                    name: 'Accesorios',
                    description: 'Relojes, bolsos, lentes, etc.',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Categoría creada exitosamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Categoría creada correctamente.',
                    data: {
                        id: 5,
                        name: 'Accesorios',
                        description: 'Relojes, bolsos, lentes, etc.',
                    },
                },
            },
        },
    })
    create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto);
    }

    // ============================================================
    // Actualizar categoría (ADMIN)
    // ============================================================

    /**
     * Actualiza la información de una categoría existente.
     *
     * Solo accesible por administradores.
     */
    @Roles('ADMIN')
    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar categoría (ADMIN)',
        description:
            'Modifica los datos de una categoría específica. Solo accesible para administradores.',
    })
    @ApiParam({
        name: 'id',
        required: true,
        example: 3,
        description: 'ID de la categoría que desea modificar.',
    })
    @ApiBody({
        type: UpdateCategoryDto,
        examples: {
            ejemplo: {
                summary: 'Actualizar categoría',
                value: {
                    name: 'Electrónica y Gadgets',
                    description: 'Tecnología moderna y accesorios.',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Categoría actualizada correctamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Categoría actualizada exitosamente.',
                    data: {
                        id: 1,
                        name: 'Electrónica y Gadgets',
                        description: 'Tecnología moderna y accesorios.',
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Categoría no encontrada.',
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoryService.update(id, dto);
    }

    // ============================================================
    // Eliminar categoría (ADMIN)
    // ============================================================

    /**
     * Elimina una categoría del sistema.
     *
     * Solo accesible para administradores.
     */
    @Roles('ADMIN')
    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar categoría (ADMIN)',
        description: 'Elimina una categoría específica. Solo administradores.',
    })
    @ApiParam({
        name: 'id',
        required: true,
        example: 4,
        description: 'ID de la categoría a eliminar.',
    })
    @ApiResponse({
        status: 200,
        description: 'Categoría eliminada correctamente.',
        content: {
            'application/json': {
                example: {
                    message: 'Categoría eliminada.',
                    deletedId: 4,
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Categoría no encontrada.',
        content: {
            'application/json': {
                example: {
                    statusCode: 404,
                    message: 'Categoría no encontrada',
                    error: 'Not Found',
                },
            },
        },
    })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.remove(id);
    }
}
