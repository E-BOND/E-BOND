import { Controller, Post, Body, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { ImportProductsDto } from './dtos/import-products.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post('import/tech')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Importar productos tecnológicos desde DummyJSON (solo ADMIN)' })
    @ApiBody({ type: ImportProductsDto })
    async importTechProducts(@Body() body: ImportProductsDto) {
        return await this.productService.importTechProductsFromDummyJSON(body.categoryIds);
    }

    @Get('external/tech')
    @ApiOperation({ summary: 'Obtener todos los productos tech desde DummyJSON' })
    async getExternalTechProducts() {
        return await this.productService.getExternalTechProducts();
    }

    @Get('external/search')
    @ApiQuery({ name: 'q', required: true, description: 'Texto de búsqueda' })
    @ApiOperation({ summary: 'Buscar productos tecnológicos en DummyJSON' })
    async searchExternalProducts(@Query('q') query: string) {
        return await this.productService.searchExternalTechProducts(query);
    }

    @Get('local')
    @ApiOperation({ summary: 'Obtener todos los productos importados en la base local' })
    async getLocalProducts() {
        return await this.productService.getLocalProducts();
    }

    @Get('local/by-id')
    @ApiQuery({ name: 'id', required: true })
    @ApiOperation({ summary: 'Obtener un producto por ID desde la base local' })
    async getLocalProductById(@Query('id', ParseIntPipe) id: number) {
        return await this.productService.getLocalProductById(id);
    }
}
