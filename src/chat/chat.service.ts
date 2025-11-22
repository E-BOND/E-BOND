import { Injectable } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';
import { PaymentMethodService } from '../pay-methods/pay-method.service';

@Injectable()
export class ChatService {
    constructor(
        private readonly productService: ProductService,
        private readonly orderService: OrderService,
        private readonly paymentMethodService: PaymentMethodService,
    ) {}

    // ============================================================
    // 🔍 MÉTODO CENTRAL DE BÚSQUEDA (LOCAL → EXTERNO)
    // ============================================================

    private async hybridProductSearch(query: string) {
        // 1️⃣ Buscar primero en la base local
        const localProducts = await this.productService.getLocalProducts();
        const foundLocal = localProducts.find(p =>
            p.name.toLowerCase().includes(query.toLowerCase()),
        );

        if (foundLocal) return { product: foundLocal, source: 'local' };

        // 2️⃣ Si no existe local, buscar externo
        const external = await this.productService.searchExternalTechProducts(query);

        if (external.total > 0) {
            const ext = external.results[0]; // Tomamos el primer match
            return {
                product: {
                    id: ext.id,
                    name: ext.title,
                    description: ext.description,
                    price: ext.price,
                    imageUrl: ext.thumbnail,
                    cantidad: ext.stock ?? 0,
                    available: ext.stock > 0,
                },
                source: 'external',
            };
        }

        return { product: null, source: 'none' };
    }

    // ============================================================
    // 🔧 FUNCIÓN FAKE PARA STOCK LOCAL/EXTERNO
    // ============================================================

    private async getStockInfo(product: any) {
        return {
            available: product.cantidad > 0,
            quantity: product.cantidad,
        };
    }

    // ============================================================
    // 🔧 FUNCIÓN FAKE DE RECOMENDACIONES
    // ============================================================

    private async getRecommendations(productId: number, customerId: string) {
        const products = await this.productService.getLocalProducts();
        
        return products
            .filter(p => p.id !== productId)
            .slice(0, 5);
    }

    // ============================================================
    // 🔧 FUNCIÓN FAKE DE GARANTÍA
    // ============================================================

    private async getWarrantyInfo(productId: number) {
        return {
            duration: '12 meses',
            type: 'Garantía oficial del fabricante',
        };
    }

    // ============================================================
    // 🟦 CONSULTAR DISPONIBILIDAD
    // ============================================================

    async checkProductAvailability(productQuery: string, customerId: string) {
        const { product, source } = await this.hybridProductSearch(productQuery);

        if (!product) {
            return {
                available: false,
                message: `No pude encontrar el producto **"${productQuery}"**.`,
            };
        }

        const stockInfo = await this.getStockInfo(product);
        const recommendations = await this.getRecommendations(product.id, customerId);

        return {
            available: stockInfo.available,
            source,
            product,
            stock: stockInfo,
            message: stockInfo.available
                ? `Sí, **${product.name}** está disponible 🙌. Quedan **${stockInfo.quantity}** unidades.`
                : `Actualmente **${product.name}** está agotado 😞`,
            recommendations: recommendations.slice(0, 3),
        };
    }

    // ============================================================
    // 🟦 COMPARAR PRODUCTOS
    // ============================================================

    async compareProducts(productQueries: string[]) {
        const searchResults = await Promise.all(
            productQueries.map(q => this.hybridProductSearch(q)),
        );

        const valid = searchResults.filter(res => res.product !== null);

        if (valid.length < 2) {
            return {
                success: false,
                message: 'Necesito al menos **dos productos** válidos para comparar.',
            };
        }

        return {
            success: true,
            message: `Aquí tienes la comparación entre ${valid.length} productos 👇`,
            products: valid.map(v => v.product),
        };
    }

    // ============================================================
    // 🟦 OBTENER INFORMACIÓN DE GARANTÍA
    // ============================================================

    async getWarrantyInfoForChat(productQuery: string) {
        const { product } = await this.hybridProductSearch(productQuery);

        if (!product) {
            return {
                found: false,
                message: `No encontré el producto **"${productQuery}"**.`,
            };
        }

        const warranty = await this.getWarrantyInfo(product.id);

        return {
            found: true,
            product: product.name,
            warranty,
            message: `🛡️ La garantía de **${product.name}** es: **${warranty.duration}**, tipo **${warranty.type}**.`,
        };
    }

    // ============================================================
    // 💳 MÉTODOS DE PAGO
    // ============================================================

    async getPaymentMethodsInfo() {
        const methods = await this.paymentMethodService.getAvailablePaymentMethods();

        return {
            methods,
            message: `💳 Disponemos de **${methods.length} métodos de pago**. Puedes elegir el que prefieras 😊`,
            
            securityInfo: {
                encrypted: true,
                fraudProtection: true,
                moneyBackGuarantee: true,
                sslCertified: true
            }
        };
    }

    // ============================================================
    // 📦 HISTORIAL DE PEDIDOS
    // ============================================================

    private calculateFavoriteCategory(orders: any[]): string {
        if (!orders || orders.length === 0) return 'Sin compras';

        const counts: Record<string, number> = {};

        for (const order of orders) {
            for (const detail of order.details ?? []) {
                for (const category of detail.product?.categories ?? []) {
                    counts[category.name] = (counts[category.name] || 0) + 1;
                }
            }
        }

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

        return sorted[0]?.[0] ?? 'Sin categoría';
    }


    async getCustomerOrderHistory(customerId: string) {
        const orders = await this.orderService.getUserOrderHistory(Number(customerId));

        if (!orders.length) {
            return {
                totalOrders: 0,
                totalSpent: 0,
                recentOrders: [],
                favoriteCategory: 'Sin compras',
                message: 'Aún no tienes pedidos registrados.',
            };
        }

        return {
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + Number(order.total), 0),
            recentOrders: orders.slice(0, 5),
            favoriteCategory: this.calculateFavoriteCategory(orders),
            message: `Tienes **${orders.length} pedidos** en tu historial 📦`,
        };
    }
}
