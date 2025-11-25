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
                description: productDetail.description,
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
            const numericPrice = parseFloat(String(productDetail.price ?? '0'));
            const price = isNaN(numericPrice) || numericPrice === 0 ? 'N/A' : numericPrice.toFixed(2);
            return {
                name: productDetail.name,
                price: price,
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

 // ===========================================
// MÉTODO CORREGIDO: getCustomerOrderHistory
// ===========================================
async getCustomerOrderHistory(customerId: string) {
    // 1. Convertir el ID de string (del JWT) a number
    const userId = parseInt(customerId, 10);
    
    if (isNaN(userId)) {
        return this.formatEmptyHistory('Error: ID de usuario no válido.');
    }

    try {
        // 2. Obtener la historia de OrderService. (Asumimos que carga las categorías)
        const orders = await this.orderService.getUserOrderHistory(userId);
        
        if (orders.length === 0) {
            return this.formatEmptyHistory();
        }

        // 3. Procesar y calcular estadísticas
        let totalSpent = 0;
        const categoryCounts: { [category: string]: number } = {};

        for (const order of orders) {
            // 🚨 CORRECCIÓN CLAVE: Usamos Number() para asegurar que order.total 
            // se convierte a un número antes de sumarse, evitando el TypeError.
            totalSpent += Number(order.total);
            
            // Recorrer detalles para calcular la categoría favorita
            if (order.details) {
                for (const detail of order.details) {
                    
                    // LÓGICA DE CATEGORÍAS (M:M): Iteramos sobre el array 'categories'
                    if (detail.product?.categories?.length) { 
                        for (const category of detail.product.categories) {
                            // Usamos 'name' como lo tenías en el código.
                            const categoryName = category.name || 'Otros';
                            // Sumamos la cantidad vendida al contador de esa categoría
                            categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + detail.quantity;
                        }
                    } else {
                        // Si un producto no tiene categorías asignadas
                        categoryCounts['Sin Categorizar'] = (categoryCounts['Sin Categorizar'] || 0) + detail.quantity;
                    }
                }
            }
        }

        // 4. Encontrar la categoría favorita
        let favoriteCategory = 'Sin Compras';
        let maxQuantity = 0;

        for (const category in categoryCounts) {
            if (categoryCounts[category] > maxQuantity) {
                maxQuantity = categoryCounts[category];
                favoriteCategory = category;
            }
        }
        
        // 5. Formatear y retornar la respuesta
        return {
            message: `¡Encontré **${orders.length} pedidos**! Aquí está tu resumen.`,
            totalOrders: orders.length,
            // totalSpent ahora es un número garantizado, toFixed funciona.
            totalSpent: totalSpent.toFixed(2), 
            // Solo retornamos los datos básicos de los últimos 3 pedidos
            recentOrders: orders.slice(0, 3).map(o => ({ 
                id: o.id, 
                // Aseguramos que el total en la respuesta también se formatee correctamente.
                total: Number(o.total).toFixed(2), 
                status: o.status 
            })), 
            favoriteCategory: favoriteCategory,
        };

    } catch (error) {
        // Este error ya no debería ser por totalSpent, sino por un problema en la DB
        console.error('Error al obtener historial de órdenes:', error);
        return this.formatEmptyHistory('Hubo un error interno al consultar el historial.');
    }
}

// ===========================================
// MÉTODO AUXILIAR
// ===========================================

private formatEmptyHistory(customMessage?: string) {
    return {
        message: customMessage || 'Aún no tienes pedidos registrados.',
        totalOrders: 0,
        // 🚨 CORREGIDO: Debe ser el número 0
        totalSpent: 0, 
        recentOrders: [],
        favoriteCategory: 'Sin compras',
    };
}
}