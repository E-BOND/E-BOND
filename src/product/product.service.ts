import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
    private readonly externalApiUrl: string;
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        private readonly httpService: HttpService,

        private readonly configService: ConfigService,
    ) {
        this.externalApiUrl = this.configService.get<string>(
            'EXTERNAL_PRODUCTS_API_URL'
        )!;
    }

    // ===========================
    // OBTENER productos tech externos
    // ===========================
    async getExternalTechProducts() {
        try {
            const techCategories = ['smartphones', 'laptops', 'tablets'];
            let allTechProducts: any[] = [];
            let skip = 0;
            const limit = 100; // máximo que DummyJSON permite por request

            while (true) {
            const resp$ = this.httpService.get(
                `${this.externalApiUrl}?limit=${limit}&skip=${skip}`,
            );
            const response = await firstValueFrom(resp$);
            const data = response.data;

            if (!data?.products || !Array.isArray(data.products)) break;

            // Filtramos solo categorías tech
            const techProducts = data.products.filter((p: any) =>
                techCategories.includes(p.category),
            );

            allTechProducts.push(...techProducts);

            skip += limit;

            // Si llegamos al final de la lista
            if (skip >= data.total) break;
            }

            return allTechProducts;
        } catch (error: any) {
            throw new HttpException(
            `Error obteniendo productos tech: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    // ===========================
    // BUSCAR productos tech por query
    // ===========================
    async searchExternalTechProducts(query: string) {
        try {
        const resp$ = this.httpService.get(
            `${this.externalApiUrl}/search?q=${encodeURIComponent(query)}`,
        );
        const response = await firstValueFrom(resp$);
        const data = response.data;

        if (!data?.products || !Array.isArray(data.products)) {
            throw new HttpException(
            'No se encontraron productos externos',
            HttpStatus.NOT_FOUND,
            );
        }

        const techCategories = ['smartphones', 'laptops', 'tablets'];
        const techProducts = data.products.filter((p: any) =>
            techCategories.includes(p.category),
        );

        return techProducts;
        } catch (error: any) {
        throw new HttpException(
            `Error buscando productos tech: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        }
    }

    // ===========================
    // IMPORTAR productos tech a la DB
    // ===========================
    async importTechProductsFromDummyJSON(categoryIds?: number[]) {
        try {
        // Traemos los productos tech externos
        const techProducts = await this.getExternalTechProducts();

        // Traemos categorías si se pasaron IDs
        let categories: Category[] = [];
        if (categoryIds && categoryIds.length > 0) {
            categories = await this.categoryRepository.find({
            where: { id: In(categoryIds) },
            });
        }

        // Mapear productos a entidades de DB
        const entitiesToSave: Product[] = techProducts.map((p: any) => {
            const product = this.productRepository.create({
            name: p.title ?? p.name ?? 'Sin nombre',
            description: p.description ?? '',
            price: Number(p.price ?? 0),
            cantidad: Number(p.stock ?? 0),
            available: Number(p.stock ?? 0) > 0,
            imageUrl: p.thumbnail ?? (p.images && p.images[0]) ?? null,
            });

            if (categories.length > 0) product.categories = categories;

            return product;
        });

        const savedProducts = await this.productRepository.save(entitiesToSave);

        return {
            message: 'Importación completa',
            imported: savedProducts.length,
            categoriesApplied: categories.map(c => c.id),
        };
        } catch (error: any) {
        throw new HttpException(
            `Error importando productos: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        }
    }

    // ===========================
    // GET productos locales
    // ===========================
    async getLocalProducts() {
        return await this.productRepository.find({ relations: ['categories'] });
    }

    // ===========================
    // GET producto local por ID
    // ===========================
    async getLocalProductById(id: number) {
        const product = await this.productRepository.findOne({
        where: { id },
        relations: ['categories'],
        });

        if (!product) {
        throw new HttpException(
            'Producto no encontrado en la base local',
            HttpStatus.NOT_FOUND,
        );
        }

        return product;
    }

    // ===========================
    // GET producto local por nombre
    // ===========================
    async searchLocalProductDetails(query: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({
        where: [
            { name: ILike(`%${query}%`) },
            { description: ILike(`%${query}%`) },
        ],
        relations: ['categories'],
    });

    // Devuelve el producto encontrado o null si no hay coincidencias.
    return product || null; 
}
// ===========================
//  BUSQUEDA MÚLTIPLE para COMPARACIÓN
// ===========================
async searchMultipleLocalProducts(queries: string[]): Promise<Product[]> {
    if (!queries || queries.length === 0) {
        return [];
    }

    // Crear una lista de condiciones para buscar cada consulta en el nombre o descripción
    const conditions = queries.flatMap(query => [
        { name: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
    ]);

    // Usar find y el operador OR implícito de TypeORM para buscar por múltiples condiciones.
    const products = await this.productRepository.find({
        where: conditions,
        relations: ['categories'],
    });
    
    // Devolver solo los resultados únicos
    const uniqueProducts = Array.from(new Set(products.map(p => p.id)))
        .map(id => products.find(p => p.id === id)) as Product[];
        
    return uniqueProducts;
}
}
