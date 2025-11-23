import { Injectable } from '@nestjs/common';
// Asumo que tienes estos servicios en estas rutas
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

    

    async checkProductAvailability(productQuery: string, customerId: string) {

        const productDetail = await this.productService.searchLocalProductDetails(productQuery); 

        if (productDetail) {

        const stockQuantity = productDetail.cantidad; 
        // La disponibilidad depende de la bandera 'available' y de que haya stock > 0
        const isAvailable = productDetail.available && stockQuantity > 0;

        return { 
                available: isAvailable, 
                message: `El producto "${productDetail.name}" está ${isAvailable ? 'en stock' : 'agotado'}.`, 
                product: { 
                name: productDetail.name, 
                price: productDetail.price, 
                available: isAvailable,
                stock: { 
                    quantity: stockQuantity, 
                    lowStock: stockQuantity < 5 
                },
            } 
    };
    } else {
        return {
            available: false,
            message: `Lo siento, no se encontró **en nuestro inventario** ningún producto relacionado con "${productQuery}".`,
            product: null,
    };
    }
}

    async compareProducts(productQueries: string[]) {
    if (!productQueries || productQueries.length < 2) {
        return { success: false, message: 'Necesitas al menos dos productos para comparar.' };
    }

 
    const foundProducts = await this.productService.searchMultipleLocalProducts(productQueries);
    
    
    const comparisonResults = productQueries.map((query) => {
        const productDetail = foundProducts.find(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.description.toLowerCase().includes(query.toLowerCase())
        );

        if (productDetail) {
            const stockQuantity = productDetail.cantidad;
            const isAvailable = productDetail.available && stockQuantity > 0;
            
            return {
                name: productDetail.name,
                price: productDetail.price.toFixed(2),
                available: isAvailable,
                categories: productDetail.categories.map(c => c.name).join(', ') || 'N/A',
                // Bandera interna para saber si el producto fue encontrado y es real
                isReal: true, 
            };
        } else {
            return {
                name: query, 
                price: 'N/A',
                available: false,
                categories: 'N/A',
                isReal: false, // No encontrado
            };
        }
    });
    const realProductsCount = comparisonResults.filter(p => p.isReal).length;

    if (realProductsCount < 2) {
        // Si no se encontraron DOS productos válidos (realProductsCount es 0 o 1)
        const notFoundQueries = comparisonResults.filter(p => !p.isReal).map(p => `"${p.name}"`).join(', ');
        
        const message = realProductsCount === 0 
            ? 'Lo sentimos, no pudimos encontrar **ninguno** de los productos solicitados en nuestro inventario. Por favor, asegúrate de que ambos productos existan.'
            : `Solo pudimos encontrar **${comparisonResults.find(p => p.isReal)?.name}**. No podemos compararlo con ${notFoundQueries}. Por favor, **ingresa un segundo producto disponible** para poder realizar la comparación.`;

        // Devuelve el mensaje de error SIN la estructura de comparación (data.products)
        return { 
            success: false, 
            message: message,
        };
    }
    const finalMessage = 'Aquí tienes la comparación de los productos disponibles en nuestro inventario.';

    // Antes de enviar, eliminamos la bandera 'isReal' para el cliente
    const productsToSend = comparisonResults.map(({ isReal, ...rest }) => rest);
    
    return { 
        success: true, 
        message: finalMessage, 
        products: productsToSend
    };
}
    async getWarrantyInfoForChat(productQuery: string) {
        return { found: true, message: `La garantía del ${productQuery} es de 1 año.`, warranty: { duration: '1 año' } };
    }

    async getPaymentMethodsInfo() {
        const methods = [
            { name: 'Visa/Mastercard', description: 'Aceptamos todas las tarjetas.' },
            { name: 'PayPal', description: 'Pago seguro online.' }
        ];
        return { methods, message: 'Métodos de pago disponibles.', securityInfo: { encrypted: true } };
    }

    async getCustomerOrderHistory(customerId: string) {
        if (Number(customerId) === 1) {
            const orders = [
                { id: 101, total: 150.50, status: 'Enviado' },
                { id: 102, total: 25.00, status: 'Entregado' }
            ];
            return {
                totalOrders: orders.length,
                totalSpent: 175.50,
                recentOrders: orders,
                favoriteCategory: 'Electrónica',
                message: `Tienes ${orders.length} pedidos en tu historial 📦`,
            };
        }
        return { totalOrders: 0, totalSpent: 0, recentOrders: [], favoriteCategory: 'Sin compras', message: 'Aún no tienes pedidos registrados.' };
    }
}