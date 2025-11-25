/**
 * Controlador responsable de gestionar productos tecnológicos del sistema.
 *
 * Funcionalidades:
 * - Importar productos tecnológicos desde DummyJSON (ADMIN)
 * - Consultar productos externos desde DummyJSON
 * - Buscar productos externos por texto
 * - Listar productos importados en la base de datos local
 * - Obtener un producto importado por su ID
 */
import { 
    Controller, 
    Post, 
    Body, 
    Get, 
    Query, 
    ParseIntPipe, 
    UseGuards 
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ImportProductsDto } from './dtos/import-products.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    // ============================================================
    // POST /products/import/tech  (ADMIN)
    // ============================================================
    /**
     * Importa productos tecnológicos desde la API de DummyJSON.
     *
     * Solo disponible para administradores.
     */
    @Post('import/tech')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Importar productos tecnológicos desde DummyJSON (solo ADMIN)' })
    @ApiBody({ type: ImportProductsDto })
    async importTechProducts(@Body() body: ImportProductsDto) {
        return await this.productService.importTechProductsFromDummyJSON(body.categoryIds);
    }

    // ============================================================
    // GET /products/external/tech  (PUBLICO AUTENTICADO)
    // ============================================================
    /**
     * Obtiene todos los productos tecnológicos desde DummyJSON.
     */
    @Get('external/tech')
    @ApiOperation({ summary: 'Obtener todos los productos tech desde DummyJSON' })
    async getExternalTechProducts() {
        return await this.productService.getExternalTechProducts();
    }

    // ============================================================
    // GET /products/external/search?q=texto  (PUBLICO AUTENTICADO)
    // ============================================================
    /**
     * Busca productos tecnológicos en DummyJSON usando texto de búsqueda.
     */
    @Get('external/search')
    @ApiQuery({ name: 'q', required: true, description: 'Texto de búsqueda' })
    @ApiOperation({ summary: 'Buscar productos tecnológicos en DummyJSON' })
    async searchExternalProducts(@Query('q') query: string) {
        return await this.productService.searchExternalTechProducts(query);
    }

    // ============================================================
    // GET /products/local  (PUBLICO AUTENTICADO)
    // ============================================================
    /**
     * Obtiene todos los productos tecnológicos importados previamente en la base local.
     */
    @Get('local')
    @ApiOperation({ summary: 'Obtener todos los productos importados en la base local' })
    async getLocalProducts() {
        return await this.productService.getLocalProducts();
    }

    // ============================================================
    // GET /products/local/by-id?id=123  (PUBLICO AUTENTICADO)
    // ============================================================
    /**
     * Obtiene un producto importado desde la base local por su ID.
     */
    @Get('local/by-id')
    @ApiQuery({ name: 'id', required: true })
    @ApiOperation({ summary: 'Obtener un producto por ID desde la base local' })
    async getLocalProductById(@Query('id', ParseIntPipe) id: number) {
        return await this.productService.getLocalProductById(id);
    }
}
